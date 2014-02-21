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

  focus: ->
    @textView.focus()

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

  # Current attributes

  toggleCurrentAttribute: (attributeName) ->
    if @currentAttributes[attributeName]
      delete @currentAttributes[attributeName]
    else
      @currentAttributes[attributeName] = true
    @notifyDelegateOfCurrentAttributeChange()

  updateCurrentAttributes: ->
    if selectedRange = @textView.getSelectedRange()
      position = selectedRange[0] - 1
      @currentAttributes = @text.getAttributesAtPosition(position)
      @notifyDelegateOfCurrentAttributeChange()

  notifyDelegateOfCurrentAttributeChange: ->
    @delegate?.textControllerDidChangeCurrentAttributes?(@currentAttributes)


  # Selection observer delegate

  selectionDidChange: ->
    @updateCurrentAttributes()

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
