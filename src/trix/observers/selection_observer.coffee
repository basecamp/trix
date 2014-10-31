{DOM} = Trix

class Trix.SelectionObserver
  events = ["DOMFocusIn", "DOMFocusOut", "mousedown", "mouseup", "keydown"]

  constructor: (@element) ->
    @range = getRange()

    for event in events
      DOM.handleEvent event, onElement: @element, withCallback: @start

  start: =>
    if @running
      @update()
    else
      @running = true
      @tick()

  stop: ->
    delete @running

  tick: =>
    if DOM.elementContainsNode(document.documentElement, @element)
      @update()
      requestAnimationFrame(@tick)
    else
      @stop()

  update: ->
    range = getRange()
    unless rangesAreEqual(range, @range)
      previousRange = @range
      @range = range
      @delegate?.selectionDidChange?(range, previousRange)

  getRange = ->
    selection = window.getSelection()
    selection.getRangeAt(0) if selection.rangeCount > 0

  rangesAreEqual = (left, right) ->
    left?.startContainer is right?.startContainer and
      left?.startOffset is right?.startOffset and
      left?.endContainer is right?.endContainer and
      left?.endOffset is right?.endOffset
