#= require trix/text
#= require trix/input
#= require trix/text_view
#= require trix/selection_observer

class Trix.TextController
  constructor: (@element) ->
    @text = new Trix.Text
    @text.delegate = this
    @input = new Trix.Input @element, this
    @textView = new Trix.TextView @element, @text
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this
    @currentAttributes = {}

  # Text delegate

  didEditText: (text) ->
    @render()

  # Input responder

  insertString: (string) ->
    text = new Trix.Text(string, @currentAttributes)

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
    @textView.render()

  # Selection observer delegate

  selectionDidChange: ->
    if selectedRange = @textView.getSelectedRange()
      position = selectedRange[0] - 1
      @currentAttributes = @text.getAttributesAtPosition(position)
      @delegate?.currentAttributesDidChange?(@currentAttributes)

  # Selection

  getSelectedRange: ->
    if selectedRange = @textView.getSelectedRange()
      selectedRange unless rangeIsCollapsed(selectedRange)

  getPosition: ->
    if selectedRange = @textView.getSelectedRange()
      selectedRange[0] if rangeIsCollapsed(selectedRange)

  setPosition: (position) ->
    @textView.setSelectedRange([position, position])

  rangeIsCollapsed = ([startPosition, endPosition]) ->
    startPosition is endPosition
