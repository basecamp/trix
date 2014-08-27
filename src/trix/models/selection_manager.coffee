#= require trix/observers/selection_observer
#= require trix/models/location_range
#= require trix/utilities/dom
#= require trix/utilities/helpers

{DOM} = Trix
{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @lockCount = 0
    @selectionObserver = new Trix.SelectionObserver @element
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

  expandSelectionInDirectionWithGranularity: (direction, granularity) ->
    return unless selection = getDOMSelection()
    if selection.modify
      selection.modify("extend", direction, granularity)
    else if document.body.createTextRange
      textRange = document.body.createTextRange()
      textRange.moveToPoint(@getPointAtEndOfSelection()...)
      if direction is "forward"
        textRange.moveEnd(granularity, 1)
      else
        textRange.moveStart(granularity, -1)
      textRange.select()
    @updateCurrentLocationRange()

  lock: ->
    if @lockCount++ is 0
      @lockedLocationRange = @getLocationRange()

  unlock: ->
    if --@lockCount is 0
      lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      @setLocationRange(lockedLocationRange)

  preserveSelection: (block) ->
    point = @getPointAtEndOfSelection()
    block()
    range = @getLocationRangeAtPoint(point)
    @setDOMRange(range)
    range

  # Selection observer delegate

  selectionDidChange: (domRange) ->
    @updateCurrentLocationRange(domRange)

  # Private

  updateCurrentLocationRange: (domRange = getDOMRange()) ->
    locationRange = @createLocationRangeFromDOMRange(domRange)
    unless locationRange?.isEqualTo?(@currentLocationRange)
      @currentLocationRange = locationRange
      @delegate?.locationRangeDidChange?(@currentLocationRange)

  setDOMRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetForLocation(locationRange.start)
    rangeEnd =
      if locationRange.isCollapsed()
        rangeStart
      else
        @findContainerAndOffsetForLocation(locationRange.end)

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
      @element.contains(range.startContainer)
    else
      @element.contains(range.startContainer) and @element.contains(range.endContainer)

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

  findContainerAndOffsetForLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.offset < 1

    node = @findNodeForLocation(location)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = location.offset - node.trixPosition
    else
      container = node.parentNode
      offset =
        if location.offset is 0
          0
        else
          [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForLocation: (location) ->
    walker = DOM.createTreeWalker(@element, null, trixNodeFilter)
    node = walker.currentNode

    while walker.nextNode()
      currentNode = walker.currentNode

      if walker.currentNode.trixIndex is location.index
        startPosition = walker.currentNode.trixPosition
        endPosition = startPosition + walker.currentNode.trixLength

        if startPosition <= location.offset <= endPosition
          node = walker.currentNode
          break

    node

  trixNodeFilter = (node) ->
    if node.trixPosition? and node.trixLength?
      NodeFilter.FILTER_ACCEPT
    else
      NodeFilter.FILTER_SKIP

  getLocationRangeAtPoint: ([clientX, clientY]) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(clientX, clientY)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(clientX, clientY)

    else if document.body.createTextRange
      range = document.body.createTextRange()
      range.moveToPoint(clientX, clientY)
      range.select()
      return @updateCurrentLocationRange()

    if domRange
      @createLocationRangeFromDOMRange(domRange)

  getPointAtEndOfSelection: ->
    return unless range = getDOMRange()
    rects = range.getClientRects()
    if rects.length > 0
      rect = rects[rects.length - 1]

      clientX = rect.right
      clientY = rect.top + rect.height / 2

      if clientRectIsRelativeToBody()
        clientX -= document.body.scrollLeft
        clientY -= document.body.scrollTop

      [clientX, clientY]

  getDOMSelection = ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange = ->
    getDOMSelection()?.getRangeAt(0)

  # ClientRect position properties should be relative to the viewport,
  # but in some browsers (like mobile Safari), they're relative to the body.
  getRectTop = ->
    getDOMRange().getClientRects()[0].top

  clientRectIsRelativeToBody = memoize ->
    originalTop = getRectTop()
    window.scrollBy(0, 1)
    result = originalTop is getRectTop()
    window.scrollBy(0, -1)
    result
