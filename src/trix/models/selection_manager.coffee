#= require trix/observers/selection_observer
#= require trix/models/location
#= require trix/utilities/dom
#= require trix/utilities/helpers

{memoize} = Trix.Helpers

class Trix.SelectionManager
  constructor: (@element) ->
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

    @currentLocation = {}

  selectionDidChange: (domRange) ->
    delete @currentLocation
    @updateCurrentLocation(domRange)
    @delegate?.locationDidChange?(@currentLocation)

  updateCurrentLocation: (domRange) ->
    domRange ?= @getDOMRange()
    @currentLocation = @createLocationFromDOMRange(domRange)

  getLocation: ->
    @lockedLocation ? @currentLocation

  setLocation: (location) ->
    unless @lockedLocation?
      @setDOMRange(location)

  lock: ->
    @lockedLocation ?= @getLocation()

  unlock: ->
    if lockedLocation = @lockedLocation
      delete @lockedLocation
      lockedLocation

  getLocationAtPoint: ([pageX, pageY]) ->
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

  setDOMRange: (location) ->
    rangeStart = @findContainerAndOffsetForLocation(location.start)
    rangeEnd =
      if location.isCollapsed()
        rangeStart
      else
        @findContainerAndOffsetForLocation(location.end)

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

  createLocationFromDOMRange: (range) ->
    if range.collapsed
      if Trix.DOM.within(@element, range.endContainer)
        start = @findLocationAttributesFromContainerAtOffset(range.endContainer, range.endOffset)
        new Trix.Location start
    else
      if Trix.DOM.within(@element, range.startContainer) and Trix.DOM.within(@element, range.endContainer)
        start = @findLocationAttributesFromContainerAtOffset(range.startContainer, range.startOffset)
        end = @findLocationAttributesFromContainerAtOffset(range.endContainer, range.endOffset)
        new Trix.Location start, end

  findLocationAttributesFromContainerAtOffset: (container, offset) ->
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

  findContainerAndOffsetForLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.position < 1

    node = @findNodeForLocation(location)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = location.position - node.trixPosition
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForLocation: (location) ->
    walker = Trix.DOM.createTreeWalker(@element, null, nodeFilterForLocation)
    node = walker.currentNode

    while walker.nextNode()
      if walker.currentNode.trixIndex is location.index
        startPosition = walker.currentNode.trixPosition
        endPosition = startPosition + walker.currentNode.trixLength

        if startPosition <= location.position <= endPosition
          node = walker.currentNode
          break
    node

  nodeFilterForLocation = (node) ->
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
