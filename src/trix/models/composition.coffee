class Trix.Composition
  constructor: (@text) ->
    @currentAttributes = {}
    @invalidated = false
    @selectedRange = 0

  insertText: (text, updatePosition = true) ->
    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.replaceTextAtRange(text, selectedRange)
    else
      position = @getPosition()
      @text.insertTextAtPosition(text, position)

    @requestPosition(position + (if updatePosition then text.getLength() else 0))

  insertString: (string, updatePosition = true) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, updatePosition)

  insertAttachment: (attachment, updatePosition = true) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
    @insertText(text, updatePosition)

  deleteFromCurrentPosition: (distance = -1) ->
    unless range = @getSelectedRange()
      position = @getPosition()
      offset = position + distance
      range = if distance < 0 then [offset, position] else [position, offset]

    @text.removeTextAtRange(range)
    @requestPosition(range[0])

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

  moveTextFromRange: (range) ->
    position = @getPosition()
    @text.moveTextFromRangeToPosition(range, position)
    @requestPosition(position)

  getTextFromSelection: ->
    if selectedRange = @getSelectedRange()
      @text.getTextAtRange(selectedRange)

  # Current attributes

  inheritableAttributes = "bold italic underline".split(" ")

  toggleCurrentAttribute: (attributeName) ->
    value = not @currentAttributes[attributeName]
    @setCurrentAttribute(attributeName, value)

  setCurrentAttribute: (attributeName, value) ->
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
    else if (position = @getPosition())?
      @currentAttributes = {}
      attributes = @text.getAttributesAtPosition(position)
      attributesLeft = @text.getAttributesAtPosition(position - 1)

      for key, value of attributesLeft
        if value is attributes[key] or key in inheritableAttributes
          @currentAttributes[key] = value

      @notifyDelegateOfCurrentAttributesChange()

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(this, @currentAttributes)

  # Position and selected range

  getPosition: ->
    if range = @selectionDelegate?.getSelectedRangeForComposition?(this)
      [start, end] = range
      start if start is end

  requestPosition: (position) ->
    @requestSelectedRange([position, position])

  getSelectedRange: ->
    if range = @selectionDelegate?.getSelectedRangeForComposition?(this)
      [start, end] = range
      range unless start is end

  requestSelectedRange: (range) ->
    @selectionDelegate?.compositionDidRequestSelectionOfRange?(this, range)
