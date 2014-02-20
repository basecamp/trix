#= require rich_text/text
#= require rich_text/input
#= require rich_text/dom

class RichText.Controller
  constructor: (@element) ->
    @text = new RichText.Text
    @text.delegate = this
    @input = new RichText.Input @element, this
    @dom = new RichText.DOM @element

  # Text delegate

  didEditText: (text) ->
    @render()

  # Input responder

  insertString: (string) ->
    text = new RichText.Text(string)

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

  # Selection

  getSelectedRange: ->
    selectedRange = @dom.getSelectedRange()
    selectedRange unless rangeIsCollapsed(selectedRange)

  getPosition: ->
    selectedRange = @dom.getSelectedRange()
    selectedRange[0] if rangeIsCollapsed(selectedRange)

  setPosition: (position) ->
    @dom.setSelectedRange([position, position])

  rangeIsCollapsed = ([startPosition, endPosition]) ->
    startPosition is endPosition
