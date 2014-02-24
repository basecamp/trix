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

  insertString: (string, updatePosition = true) ->
    text = new Trix.Text(string)

    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.replaceTextAtRange(text, selectedRange)
    else
      position = @getPosition()
      @text.insertTextAtPosition(text, position)

    @setPosition(position + (if updatePosition then string.length else 0))

  deleteFromCurrentPosition: (distance = -1) ->
    unless range = @getSelectedRange()
      position = @getPosition()
      offset = position + distance
      range = if distance < 0 then [offset, position] else [position, offset]

    @text.removeTextAtRange(range)
    @setPosition(range[0])

  deleteBackward: ->
    @deleteFromCurrentPosition(-1)

  deleteForward: ->
    @deleteFromCurrentPosition(1)

  deleteWordBackward: ->
    if @getSelectedRange()
      @deleteBackward()
    else
      position = @getPosition()
      stringBeforePosition = @text.getStringAtRange([0, position])
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)
      @deleteFromCurrentPosition(positionBeforeLastWord - position)

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
