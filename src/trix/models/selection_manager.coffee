#= require trix/models/location_range
#= require trix/utilities/dom_range_change
#= require trix/observers/selection_change_observer

{DOM} = Trix
{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @lockCount = 0
    Trix.selectionChangeObserver.registerSelectionManager(this)

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
    Trix.selectionChangeObserver.update()

  # TODO: Combine with #expandSelectionInDirectionWithGranularity and add IE compatibility
  adjustSelectionInDirectionWithGranularity: (direction, granularity) ->
    return unless selection = getDOMSelection()
    alter = if selection.isCollapsed then "move" else "extend"
    selection.modify(alter, direction, granularity)
    Trix.selectionChangeObserver.update()

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

  # Private

  selectionDidChange: =>
    unless DOM.elementContainsNode(document.documentElement, @element)
      Trix.selectionChangeObserver.unregisterSelectionManager(this)

    previousRange = @range
    @range = getDOMRange()

    if @range and previousRange
      rangeChange = new Trix.DOMRangeChange({@range, previousRange, @element})

    if rangeChange?.needsAdjustment()
      @adjustSelectionInDirectionWithGranularity(rangeChange.getDirection(), "character")
    else
      @updateCurrentLocationRange()

  getBlockElements: ->
    @delegate?.selectionManagerDidRequestBlockElements?()

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
      DOM.elementContainsNode(@element, range.startContainer)
    else
      DOM.elementContainsNode(@element, range.startContainer) and DOM.elementContainsNode(@element, range.endContainer)

  findLocationFromContainerAtOffset: (container, containerOffset) ->
    return index: 0, offset: 0 if container is @element and containerOffset is 0

    blockElements = @getBlockElements()
    return index: 0, offset: 0 if Object.keys(blockElements).length is 0

    node = DOM.findNodeForContainerAtOffset(container, containerOffset)
    offset = 0

    for blockElement, index in blockElements when DOM.elementContainsNode(blockElement, node)
      walker = DOM.walkTree(blockElement)
      while walker.nextNode()
        if walker.currentNode is node
          if container.nodeType is Node.TEXT_NODE and not nodeIsCursorTarget(walker.currentNode)
            offset += containerOffset
          else if containerOffset > 0
            offset += nodeLength(walker.currentNode)
          return {index, offset}
        else
          offset += nodeLength(walker.currentNode)
      return {index, offset}

  findContainerAndOffsetForLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.offset is 0
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
    blockElement = @getBlockElements()[location.index]
    offset = 0
    walker = DOM.walkTree(blockElement)
    while walker.nextNode()
      length = nodeLength(walker.currentNode)
      if location.offset <= offset + length
        if walker.currentNode.nodeType is Node.TEXT_NODE
          node = walker.currentNode
          nodeOffset = offset
          break if location.offset is nodeOffset and nodeIsCursorTarget(node)
        else if not node
          node = walker.currentNode
          nodeOffset = offset
      offset += length
      break if offset > location.offset

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
    if node.nodeType is Node.TEXT_NODE
      if nodeIsCursorTarget(node)
        0
      else if DOM.findClosestElementFromNode(node)?.isContentEditable
        node.length
      else
        0
    else if node.nodeName in ["BR", "FIGURE"]
      1
    else
      0

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
