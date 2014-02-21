#= require trix/text
#= require trix/input
#= require trix/dom
#= require trix/selection_observer

class Trix.TextController
  constructor: (@element) ->
    @text = new Trix.Text
    @text.delegate = this
    @input = new Trix.Input @element, this
    @dom = new Trix.DOM @element
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

  # Text delegate

  didEditText: (text) ->
    @render()

  # Input responder

  insertString: (string) ->
    text = new Trix.Text(string)

    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.replaceTextAtRange(text, selectedRange)
    else
      position = @getPosition()
      @text.insertTextAtPosition(text, position)

    @setPosition(position + string.length)

  deleteBackward: ->
    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.removeTextAtRange(selectedRange)
      @setPosition(position)
    else
      position = @getPosition()
      if position > 0
        @text.removeTextAtRange([position - 1, position])
        @setPosition(position - 1)

  render: ->
    @dom.render(@text)

  # Selection observer delegate

  selectionDidChange: ->
    console.log "selection changed: position =", @getPosition(), "selected range =", @getSelectedRange()

  # Selection

  getSelectedRange: ->
    if selectedRange = @dom.getSelectedRange()
      selectedRange unless rangeIsCollapsed(selectedRange)

  getPosition: ->
    if selectedRange = @dom.getSelectedRange()
      selectedRange[0] if rangeIsCollapsed(selectedRange)

  setPosition: (position) ->
    @dom.setSelectedRange([position, position])

  rangeIsCollapsed = ([startPosition, endPosition]) ->
    startPosition is endPosition
