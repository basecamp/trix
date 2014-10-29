{handleEvent} = Trix.DOM

class Trix.SelectionObserver
  events = ["DOMFocusIn", "DOMFocusOut", "mousedown", "keydown"]

  constructor: (@element) ->
    @range = getRange()

    for event in events
      handleEvent event, onElement: @element, withCallback: @start

  start: =>
    if @running
      @update()
    else
      @running = true
      requestAnimationFrame(@tick)

  stop: ->
    delete @running

  tick: =>
    if document.contains(@element)
      @update()
      requestAnimationFrame(@tick)
    else
      @stop()

  update: ->
    range = getRange()
    unless rangesAreEqual(range, @range)
      @delegate?.selectionDidChange?(range, @range)
      @range = range

  getRange = ->
    selection = window.getSelection()
    selection.getRangeAt(0) if selection.rangeCount > 0

  rangesAreEqual = (left, right) ->
    left?.startContainer is right?.startContainer and
      left?.startOffset is right?.startOffset and
      left?.endContainer is right?.endContainer and
      left?.endOffset is right?.endOffset
