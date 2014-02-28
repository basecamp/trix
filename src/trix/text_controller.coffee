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

  insertString: (string, updatePosition = true) ->
    text = new Trix.Text(string, @currentAttributes)

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
    @textView.render()
    @delegate?.textControllerDidRender?()

  # Current attributes

  toggleCurrentAttribute: (attributeName) ->
    if selectedRange = @getSelectedRange()
      if @currentAttributes[attributeName]
        @text.removeAttributeAtRange(attributeName, selectedRange)
      else
        @text.addAttributeAtRange(attributeName, true, selectedRange)
    else
      if @currentAttributes[attributeName]
        delete @currentAttributes[attributeName]
      else
        @currentAttributes[attributeName] = true

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttribute: (attributeName, value) ->
    if selectedRange = @getSelectedRange()
      if value
        attributes = {}
        attributes[attributeName] = value
        @text.addAttributesAtRange(attributes, selectedRange)
      else
        @text.removeAttributeAtRange(attributeName, selectedRange)
    else
      if value
        @currentAttributes[attributeName] = value
      else
        delete @currentAttributes[attributeName]

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttributes: ->
    if selectedRange = @getSelectedRange()
      @currentAttributes = @text.getCommonAttributesAtRange(selectedRange)
      @notifyDelegateOfCurrentAttributesChange()
    else if position = @getPosition()
      @currentAttributes = @text.getAttributesAtPosition(position - 1)
      @notifyDelegateOfCurrentAttributesChange()

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.textControllerDidChangeCurrentAttributes?(@currentAttributes)

  # Selection observer delegate

  selectionDidChange: ->
    @updateCurrentAttributes()
    @delegate?.textControllerDidChangeSelection?()

  # Selection

  getSelectedRange: ->
    if selectedRange = @textView.getSelectedRange()
      selectedRange unless rangeIsCollapsed(selectedRange)

  getPosition: ->
    if selectedRange = @textView.getSelectedRange()
      selectedRange[0] if rangeIsCollapsed(selectedRange)

  setPosition: (position) ->
    @textView.setSelectedRange([position, position])

  lockSelection: ->
    @textView.lockSelection()
    if selectedRange = @getSelectedRange()
      @text.addAttributeAtRange("selected", true, selectedRange)

  unlockSelection: ->
    if selectedRange = @getSelectedRange()
      @text.removeAttributeAtRange("selected", selectedRange)
    @textView.unlockSelection()

  rangeIsCollapsed = ([startPosition, endPosition]) ->
    startPosition is endPosition
