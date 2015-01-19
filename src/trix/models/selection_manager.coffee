#= require trix/models/location_range
#= require trix/observers/selection_change_observer

{DOM} = Trix
{defer, benchmark} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @lockCount = 0
    Trix.selectionChangeObserver.registerSelectionManager(this)

  getLocationRange: ->
    @lockedLocationRange ? @currentLocationRange

  setLocationRange: (start, end) ->
    return if @lockedLocationRange

    locationRange = if start instanceof Trix.LocationRange
      start
    else
      new Trix.LocationRange start, end

    if domRange = @createDOMRangeFromLocationRange(locationRange)
      # Selection#addRange is unreasonably slow in WebKit when performed in the
      # same call stack as a mouse or key event so defer calling it.
      # https://code.google.com/p/chromium/issues/detail?id=423170
      # https://code.google.com/p/chromium/issues/detail?id=138439
      defer => setDOMRange(domRange) if document.activeElement is @element
      @updateCurrentLocationRange(locationRange)

  setLocationRangeFromPoint: (point) ->
    if locationRange = @getLocationRangeAtPoint(point)
      @setLocationRange(locationRange)

  expandSelectionInDirectionWithGranularity: (direction, granularity) ->
    return unless selection = getDOMSelection()
    if selection.modify
      selection.modify("extend", direction, granularity)
    else if document.body.createTextRange
      [leftPoint, rightPoint] = @getSelectionEndPoints()

      leftRange = document.body.createTextRange()
      leftRange.moveToPoint(leftPoint...)

      rightRange = document.body.createTextRange()
      rightRange.moveToPoint(rightPoint...)

      if direction is "forward"
        rightRange.move(granularity, 1)
      else
        leftRange.move(granularity, -1)

      leftRange.setEndPoint("EndToEnd", rightRange)
      leftRange.select()
    Trix.selectionChangeObserver.update()

  locationIsCursorTarget: (location) ->
    [node, offset] = @findNodeAndOffsetForLocation(location)
    nodeIsCursorTarget(node)

  lock: ->
    if @lockCount++ is 0
      @lockedLocationRange = @getLocationRange()

  unlock: ->
    if --@lockCount is 0
      lockedLocationRange = @lockedLocationRange
      delete @lockedLocationRange
      @setLocationRange(lockedLocationRange) if lockedLocationRange?

  preserveSelection: (block) ->
    point = @getSelectionEndPoints()[0]
    locationRange = @getLocationRange()
    block()
    locationRangeAtPoint = @getLocationRangeAtPoint(point)
    @setLocationRange(locationRangeAtPoint ? locationRange)

  clearSelection: ->
    getDOMSelection()?.removeAllRanges()

  # Private

  selectionDidChange: =>
    unless DOM.elementContainsNode(document.documentElement, @element)
      Trix.selectionChangeObserver.unregisterSelectionManager(this)
    @updateCurrentLocationRange()

  updateCurrentLocationRange: (locationRange) ->
    locationRange ?= @createLocationRangeFromDOMRange(getDOMRange())
    return unless locationRange
    if (@currentLocationRange and not locationRange) or not locationRange?.isEqualTo(@currentLocationRange)
      @currentLocationRange = locationRange
      @delegate?.locationRangeDidChange?(@currentLocationRange)

  createDOMRangeFromLocationRange: (locationRange) ->
    rangeStart = @findContainerAndOffsetForLocation(locationRange.start)
    rangeEnd = if locationRange.isCollapsed()
      rangeStart
    else
      @findContainerAndOffsetForLocation(locationRange.end)

    if rangeStart? and rangeEnd?
      range = document.createRange()
      range.setStart(rangeStart...)
      range.setEnd(rangeEnd...)
      range

  createLocationRangeFromDOMRange: (range) ->
    return unless range? and @rangeWithinElement(range)
    return unless start = @findLocationFromContainerAtOffset(range.startContainer, range.startOffset)
    end = @findLocationFromContainerAtOffset(range.endContainer, range.endOffset) unless range.collapsed
    locationRange = new Trix.LocationRange start, end
    locationRange if locationRange.isValid()

  rangeWithinElement: (range) ->
    if range.collapsed
      DOM.elementContainsNode(@element, range.startContainer)
    else
      DOM.elementContainsNode(@element, range.startContainer) and DOM.elementContainsNode(@element, range.endContainer)

  findLocationFromContainerAtOffset: (container, containerOffset) ->
    index = offset = 0

    if container is @element
      if containerOffset > 0
        index = containerOffset - 1
        offset += nodeLength(node) for node in @getNodesForIndex(index)
    else
      targetNode = DOM.findNodeForContainerAtOffset(container, containerOffset)
      walker = DOM.walkTree(@element)

      while walker.nextNode()
        node = walker.currentNode

        if nodeIsBlockStartComment(node)
          if currentBlockComment
            index++
          else
            currentBlockComment = node
          offset = 0

        if node is targetNode
          if container.nodeType is Node.TEXT_NODE and not nodeIsCursorTarget(node)
            string = Trix.UTF16String.box(node.textContent)
            offset += string.offsetFromUCS2Offset(containerOffset)
          else if containerOffset > 0
            offset += nodeLength(node)
          return {index, offset}
        else
          offset += nodeLength(node)

    {index, offset}

  findContainerAndOffsetForLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.offset is 0
    [node, nodeOffset] = @findNodeAndOffsetForLocation(location)
    return unless node
    if node.nodeType is Node.TEXT_NODE
      container = node
      string = Trix.UTF16String.box(node.textContent)
      offset = string.offsetToUCS2Offset(location.offset - nodeOffset)
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + (if location.offset is 0 then 0 else 1)
    [container, offset]

  findNodeAndOffsetForLocation: (location) ->
    offset = 0
    for currentNode in @getNodesForIndex(location.index)
      length = nodeLength(currentNode)
      if location.offset <= offset + length
        if currentNode.nodeType is Node.TEXT_NODE
          node = currentNode
          nodeOffset = offset
          break if location.offset is nodeOffset and nodeIsCursorTarget(node)
        else if not node
          node = currentNode
          nodeOffset = offset
      offset += length
      break if offset > location.offset

    [node, nodeOffset]

  getNodesForIndex: (index) ->
    nodes = []
    walker = DOM.walkTree(@element)
    recordingNodes = false

    while walker.nextNode()
      node = walker.currentNode
      if nodeIsBlockStartComment(node)
        if blockIndex?
          blockIndex++
        else
          blockIndex = 0

        if blockIndex is index
          recordingNodes = true
        else if recordingNodes
          break
      else if recordingNodes
        nodes.push(node)

    nodes

  getLocationRangeAtPoint: ([clientX, clientY]) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(clientX, clientY)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(clientX, clientY)

    else if document.body.createTextRange
      # IE 11 throws "Unspecified error" when using moveToPoint
      # during a drag-and-drop operation. We'll do our best to
      # map the point to a location range and fall back to the
      # current location range if there's a problem.
      try
        domRange = document.body.createTextRange()
        domRange.moveToPoint(clientX, clientY)

    @createLocationRangeFromDOMRange(domRange ? getDOMRange())

  getSelectionEndPoints: ->
    return unless range = getDOMRange()
    rects = range.getClientRects()
    if rects.length > 0
      leftRect = rects[0]
      rightRect = rects[rects.length - 1]

      leftPoint = [leftRect.left, leftRect.top + leftRect.height / 2]
      rightPoint = [rightRect.right, rightRect.top + rightRect.height / 2]

      [leftPoint, rightPoint]

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
        string = Trix.UTF16String.box(node.textContent)
        string.length
      else
        0
    else if DOM.tagName(node) in ["br", "figure"]
      1
    else
      0

  nodeIsBlockStartComment = (node) ->
    node.nodeType is Node.COMMENT_NODE and node.data is "block"

  getDOMSelection = ->
    selection = window.getSelection()
    selection if selection.rangeCount > 0

  getDOMRange = ->
    getDOMSelection()?.getRangeAt(0)

  setDOMRange = (domRange) ->
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(domRange)
    Trix.selectionChangeObserver.update()

  getClientRects = ->
    rects = getDOMRange()?.getClientRects()
    rects if rects?.length
