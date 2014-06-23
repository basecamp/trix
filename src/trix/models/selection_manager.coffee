#= require trix/observers/selection_observer
#= require trix/models/location_range
#= require trix/utilities/dom
#= require trix/utilities/helpers

{DOM} = Trix
{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

  getLocationRange: ->
    @lockedLocationRange ? @currentLocationRange

  setLocationRange: (locationRangeOrStart, end) ->
    unless @lockedLocationRange?
      locationRange = Trix.LocationRange.create(locationRangeOrStart, end)
      @setDOMRange(locationRange)
      @updateCurrentLocationRange()

  setLocationRangeFromPoint: (point) ->
    locationRange = @getLocationRangeAtPoint(point)
    @setLocationRange(locationRange)

  lock: ->
    @lockedLocationRange ?= @getLocationRange()

  unlock: ->
    if lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      lockedLocationRange

  preserveSelection: (block) ->
    point = @getPointAtEndOfSelection()
    block()
    range = @getLocationRangeAtPoint(point)
    @setDOMRange(range)
    range

  # Selection observer delegate

  selectionDidChange: (domRange) ->
    @updateCurrentLocationRange(domRange)
    @delegate?.locationDidChange?(@currentLocationRange)

  # Private

  updateCurrentLocationRange: (domRange) ->
    domRange ?= @getDOMRange()
    @currentLocationRange = @createLocationRangeFromDOMRange(domRange)

  getDOMRange: ->
    selection = window.getSelection()
    if selection.rangeCount > 0
      selection.getRangeAt(0)

  setDOMRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetForLocationRange(locationRange.start)
    rangeEnd =
      if locationRange.isCollapsed()
        rangeStart
      else
        @findContainerAndOffsetForLocationRange(locationRange.end)

    range = document.createRange()
    try
      range.setStart(rangeStart...)
      range.setEnd(rangeEnd...)
    catch err
      range.setStart(@element, 0)
      range.setEnd(@element, 0)

    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

  createLocationRangeFromDOMRange: (range) ->
    return unless range? and @rangeWithinElement(range)
    start = @findLocationFromContainerAtOffset(range.startContainer, range.startOffset)
    end = @findLocationFromContainerAtOffset(range.endContainer, range.endOffset) unless range.collapsed
    new Trix.LocationRange start, end

  rangeWithinElement: (range) ->
    if range.collapsed
      DOM.within(@element, range.startContainer)
    else
      DOM.within(@element, range.startContainer) and DOM.within(@element, range.endContainer)

  findLocationFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      index = container.trixIndex
      offset = container.trixPosition + offset
    else
      if offset is 0
        index = container.trixIndex
        offset = container.trixPosition
      else
        node = container.childNodes[offset - 1]
        walker = DOM.createTreeWalker(node)
        walker.lastChild()
        index = walker.currentNode.trixIndex
        offset = walker.currentNode.trixPosition + walker.currentNode.trixLength

    {index, offset}

  findContainerAndOffsetForLocationRange: (loactionRange) ->
    return [@element, 0] if loactionRange.index is 0 and loactionRange.offset < 1

    node = @findNodeForLocationRange(loactionRange)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = loactionRange.offset - node.trixPosition
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForLocationRange: (range) ->
    walker = DOM.createTreeWalker(@element, null, nodeFilterForLocationRange)
    node = walker.currentNode

    while walker.nextNode()
      if walker.currentNode.trixIndex is range.index
        startPosition = walker.currentNode.trixPosition
        endPosition = startPosition + walker.currentNode.trixLength

        if startPosition <= range.offset <= endPosition
          node = walker.currentNode
          break
    node

  nodeFilterForLocationRange = (node) ->
    if node.trixPosition? and node.trixLength?
      NodeFilter.FILTER_ACCEPT
    else
      NodeFilter.FILTER_SKIP

  getLocationRangeAtPoint: ([pageX, pageY]) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(pageX, pageY)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(pageX, pageY)

    else if document.body.createTextRange
      range = document.body.createTextRange()
      range.moveToPoint(pageX, pageY)
      range.select()
      return @updateCurrentLocationRange()

    if domRange
      @createLocationRangeFromDOMRange(domRange)

  getPointAtEndOfSelection: ->
    if range = @getDOMRange()
      rects = range.getClientRects()
      if rects.length > 0
        rect = rects[rects.length - 1]

        pageX = rect.right
        pageY = rect.top + rect.height / 2

        if @clientRectIsRelativeToBody()
          pageX -= document.body.scrollLeft
          pageY -= document.body.scrollTop

        [pageX, pageY]

  # ClientRect position properties should be relative to the viewport,
  # but in some browsers (like mobile Safari), they're relative to the body.
  clientRectIsRelativeToBody: memoize ->
    getRectTop = -> window.getSelection().getRangeAt(0).getClientRects()[0].top
    originalTop = getRectTop()

    window.scrollBy(0, 1)
    result = originalTop is getRectTop()
    window.scrollBy(0, -1)

    result
