#= require trix/utilities/dom

{DOM} = Trix

class Trix.SelectionObserver
  events = ["DOMFocusIn", "DOMFocusOut", "mousedown", "keydown"]

  constructor: (@element) ->
    @element.addEventListener(event, @start) for event in events
    @range = getRange()

  start: =>
    return if @running
    @running = true
    requestAnimationFrame(@tick)

  stop: ->
    delete @running

  tick: =>
    if document.contains(@element)
      range = getRange()
      unless rangesAreEqual(range, @range)
        @delegate?.selectionDidChange?(range, @getDirectionOfSelection())
        @range = range
      requestAnimationFrame(@tick)
    else
      @stop()

  getDirectionOfSelection: ->
    selection = window.getSelection()

    if @focusNode? and @focusOffset?
      directionIsForward =
        if @focusNode is selection.focusNode
          selection.focusOffset > @focusOffset
        else
          previousNode = DOM.findNodeForContainerAtOffset(@focusNode, @focusOffset)
          currentNode = DOM.findNodeForContainerAtOffset(selection.focusNode, selection.focusOffset)
          previousNode.compareDocumentPosition(currentNode) & Node.DOCUMENT_POSITION_FOLLOWING

      direction = if directionIsForward then "forward" else "backward"

    {@focusNode, @focusOffset} = selection
    direction

  getRange = ->
    selection = window.getSelection()
    selection.getRangeAt(0) if selection.rangeCount > 0

  rangesAreEqual = (left, right) ->
    left?.startContainer is right?.startContainer and
      left?.startOffset is right?.startOffset and
      left?.endContainer is right?.endContainer and
      left?.endOffset is right?.endOffset
