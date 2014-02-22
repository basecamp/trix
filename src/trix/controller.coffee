#= require trix/text
#= require trix/input
#= require trix/dom

class Trix.Controller
  constructor: (@element) ->
    @text = new Trix.Text
    @text.delegate = this
    @input = new Trix.Input @element, this
    @dom = new Trix.DOM @element

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

  deleteWordBackwards: ->
    if @getSelectedRange()
      @deleteBackward()
    else
      position = @getPosition()
      stringBeforePosition = @text.getStringAtRange([0, position])
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)

      @text.removeTextAtRange([positionBeforeLastWord, position])
      @setPosition positionBeforeLastWord

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
