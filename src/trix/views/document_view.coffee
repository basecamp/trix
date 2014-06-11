#= require trix/utilities/helpers
#= require_self
#= require_tree .

{memoize} = Trix.Helpers

class Trix.DocumentView
  constructor: (@element, @document) ->

  render: ->
    selectedRange = @getSelectedRange()

    @element.removeChild(@element.lastChild) while @element.lastChild
    @document.eachText (text) =>
      textView = new Trix.TextView text
      @element.appendChild(textView.render())

    @setSelectedRange(selectedRange) if selectedRange

  focus: ->
    @element.focus()

  # Position & Selection

  getPositionAtPoint: ([pageX, pageY]) ->
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

  getSelectedRange: ->
    return @lockedRange if @lockedRange

    selection = window.getSelection()
    return unless selection.rangeCount > 0

    domRange = selection.getRangeAt(0)
    @findRangeFromDOMRange(domRange)

  setSelectedRange: ([startPosition, endPosition]) ->
    return if @lockedRange
    return unless startPosition? and endPosition?

    rangeStart = @findContainerAndOffsetForPosition(startPosition)
    rangeEnd =
      if startPosition is endPosition
        rangeStart
      else
        @findContainerAndOffsetForPosition(endPosition)

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

  lockSelection: ->
    @lockedRange = @getSelectedRange()

  unlockSelection: ->
    if lockedRange = @lockedRange
      delete @lockedRange
      lockedRange

  # Private

  findRangeFromDOMRange: (range) ->
    if range.collapsed
      if Trix.DOM.within(@element, range.endContainer)
        position = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [position, position]
    else
      if Trix.DOM.within(@element, range.startContainer) and Trix.DOM.within(@element, range.endContainer)
        startPosition = @findPositionFromContainerAtOffset(range.startContainer, range.startOffset)
        endPosition = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [startPosition, endPosition]

  findPositionFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      container.trixPosition + offset
    else
      if offset is 0
        container.trixPosition
      else
        node = container.childNodes[offset - 1]
        walker = Trix.DOM.createTreeWalker(node)
        walker.lastChild()
        walker.currentNode.trixPosition + walker.currentNode.trixLength

  findContainerAndOffsetForPosition: (position) ->
    return [@element, 0] if position < 1

    node = @findNodeForPosition(position)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = position - node.trixPosition
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForPosition: (position) ->
    walker = Trix.DOM.createTreeWalker(@element, null, nodeFilterForPosition)
    node = walker.currentNode

    while walker.nextNode()
      startPosition = walker.currentNode.trixPosition
      endPosition = startPosition + walker.currentNode.trixLength

      if startPosition <= position <= endPosition
        node = walker.currentNode
        break
    node

  nodeFilterForPosition = (node) ->
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
