#= require trix/observers/selection_observer
#= require trix/models/location_range
#= require trix/utilities/dom
#= require trix/utilities/helpers

{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

    @currentLocationRange = {}

  selectionDidChange: (domRange) ->
    delete @currentLocationRange
    @updateCurrentLocationRange(domRange)
    @delegate?.locationDidChange?(@currentLocationRange)

  updateCurrentLocationRange: (domRange) ->
    domRange ?= @getDOMRange()
    @currentLocationRange = @createLocationRangeFromDOMRange(domRange)

  getLocationRange: ->
    @lockedLocationRange ? @currentLocationRange

  setLocationRange: (locationRange) ->
    unless @lockedLocationRange?
      @setDOMRange(locationRange)

  lock: ->
    @lockedLocationRange ?= @getLocationRange()

  unlock: ->
    if lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      lockedLocationRange

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
      return @getSelectedRange()?[0]

    if domRange
      if range = @findRangeFromDOMRange(domRange)
        range[0]

  getPointAtEndOfSelection: ->
    selection = window.getSelection()
    if selection.rangeCount > 0
      rects = selection.getRangeAt(0).getClientRects()
      if rects.length > 0
        rect = rects[rects.length - 1]

        pageX = rect.right
        pageY = rect.top + rect.height / 2

        if @clientRectIsRelativeToBody()
          pageX -= document.body.scrollLeft
          pageY -= document.body.scrollTop

        [pageX, pageY]

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

  # Private

  createLocationRangeFromDOMRange: (range) ->
    if range.collapsed
      if Trix.DOM.within(@element, range.endContainer)
        start = @findLocationRangeAttributesFromContainerAtOffset(range.endContainer, range.endOffset)
        new Trix.LocationRange start
    else
      if Trix.DOM.within(@element, range.startContainer) and Trix.DOM.within(@element, range.endContainer)
        start = @findLocationRangeAttributesFromContainerAtOffset(range.startContainer, range.startOffset)
        end = @findLocationRangeAttributesFromContainerAtOffset(range.endContainer, range.endOffset)
        new Trix.LocationRange start, end

  findLocationRangeAttributesFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      index = container.trixIndex
      position = container.trixPosition + offset
    else
      if offset is 0
        index = container.trixIndex
        position = container.trixPosition
      else
        node = container.childNodes[offset - 1]
        walker = Trix.DOM.createTreeWalker(node)
        walker.lastChild()
        index = walker.currentNode.trixIndex
        position = walker.currentNode.trixPosition + walker.currentNode.trixLength

    {index, position}

  findContainerAndOffsetForLocationRange: (loactionRange) ->
    return [@element, 0] if loactionRange.index is 0 and loactionRange.position < 1

    node = @findNodeForLocationRange(loactionRange)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = loactionRange.position - node.trixPosition
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForLocationRange: (range) ->
    walker = Trix.DOM.createTreeWalker(@element, null, nodeFilterForLocationRange)
    node = walker.currentNode

    while walker.nextNode()
      if walker.currentNode.trixIndex is range.index
        startPosition = walker.currentNode.trixPosition
        endPosition = startPosition + walker.currentNode.trixLength

        if startPosition <= range.position <= endPosition
          node = walker.currentNode
          break
    node

  nodeFilterForLocationRange = (node) ->
    if node.trixPosition? and node.trixLength?
      NodeFilter.FILTER_ACCEPT
    else
      NodeFilter.FILTER_SKIP

  # ClientRect position properties should be relative to the viewport,
  # but in some browsers (like mobile Safari), they're relative to the body.
  clientRectIsRelativeToBody: memoize ->
    getRectTop = -> window.getSelection().getRangeAt(0).getClientRects()[0].top
    originalTop = getRectTop()

    window.scrollBy(0, 1)
    result = originalTop is getRectTop()
    window.scrollBy(0, -1)

    result
