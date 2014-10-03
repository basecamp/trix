#= require trix/observers/selection_observer
#= require trix/models/location_range
#= require trix/utilities/dom
#= require trix/utilities/helpers
#= require trix/utilities/dom_range_change

{DOM} = Trix
{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @lockCount = 0
    @selectionObserver = new Trix.SelectionObserver @element
    @selectionObserver.delegate = this

  getLocationRange: ->
    @lockedLocationRange ? @currentLocationRange

  setLocationRange: (start, end) ->
    unless @lockedLocationRange?
      locationRange = if start instanceof Trix.LocationRange
        start
      else
        new Trix.LocationRange start, end

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
    @selectionObserver.tick()

  # TODO: Combine with #expandSelectionInDirectionWithGranularity and add IE compatibility
  adjustSelectionInDirectionWithGranularity: (direction, granularity) ->
    return unless selection = getDOMSelection()
    alter = if selection.isCollapsed then "move" else "extend"
    selection.modify(alter, direction, granularity)
    @selectionObserver.tick()

  lock: ->
    if @lockCount++ is 0
      @lockedLocationRange = @getLocationRange()

  unlock: ->
    if --@lockCount is 0
      lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      @setLocationRange(lockedLocationRange) if lockedLocationRange?

  preserveSelection: (block) ->
    point = @getPointAtEndOfSelection()
    block()
    range = @getLocationRangeAtPoint(point)
    @setDOMRange(range)
    range

  # Selection observer delegate

  selectionDidChange: (range, previousRange) ->
    if range and previousRange
      rangeChange = new Trix.DOMRangeChange({range, previousRange, @element})

    if rangeChange?.needsAdjustment()
      @adjustSelectionInDirectionWithGranularity(rangeChange.getDirection(), "character")
    else
      @updateCurrentLocationRange()

  # Private

  getNodeLocations: ->
    @delegate?.selectionManagerDidRequestNodeLocations?()

  updateCurrentLocationRange: (domRange = getDOMRange()) ->
    locationRange = @createLocationRangeFromDOMRange(domRange)
    if (@currentLocationRange and not locationRange) or not locationRange?.isEqualTo(@currentLocationRange)
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
    range.setStart(rangeStart...)
    range.setEnd(rangeEnd...)

    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

  createLocationRangeFromDOMRange: (range) ->
    return unless range? and @rangeWithinElement(range)
    start = @findLocationFromContainerAtOffset(range.startContainer, range.startOffset)
    end = @findLocationFromContainerAtOffset(range.endContainer, range.endOffset) unless range.collapsed
    locationRange = new Trix.LocationRange start, end
    locationRange if locationRange.isValid()

  rangeWithinElement: (range) ->
    if range.collapsed
      @element.contains(range.startContainer)
    else
      @element.contains(range.startContainer) and @element.contains(range.endContainer)

  findLocationFromContainerAtOffset: (container, containerOffset) ->
    node = DOM.findNodeForContainerAtOffset(container, containerOffset)

    for index, offsets of @getNodeLocations()
      for offset, nodes of offsets when node in nodes
        index = Number(index)
        offset = Number(offset)
        if container.nodeType is Node.TEXT_NODE
          offset += containerOffset unless nodeIsCursorTarget(node)
        else
          offset += 1 unless containerOffset is 0
        return {index, offset}

  findContainerAndOffsetForLocation: (location) ->
    [node, nodeOffset] = @findNodeAndOffsetForLocation(location)
    return unless node
    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = location.offset - nodeOffset
    else
      container = node.parentNode
      offset =
        if location.offset is 0
          0
        else
          [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeAndOffsetForLocation: (location) ->
    for offset, nodes of @getNodeLocations()[location.index]
      offset = Number(offset)
      break if offset > location.offset

      for candidate in nodes when location.offset <= offset + nodeLength(candidate)
        if candidate.nodeType is Node.TEXT_NODE
          node = candidate
          nodeOffset = offset
          break if location.offset is nodeOffset and nodeIsCursorTarget(node)
        else if not node
          node = candidate
          nodeOffset = offset

    [node, nodeOffset]

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

  nodeIsCursorTarget = (node) ->
    return unless node
    if node.nodeType is Node.TEXT_NODE
      node.textContent is Trix.ZERO_WIDTH_SPACE
    else
      nodeIsCursorTarget(node.firstChild)

  nodeLength = (node) ->
    if nodeIsCursorTarget(node)
      0
    else if node.length?
      node.length
    else
      1

  getDOMSelection = ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange = ->
    getDOMSelection()?.getRangeAt(0)

  getClientRects = ->
    rects = getDOMRange()?.getClientRects()
    rects if rects?.length

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
