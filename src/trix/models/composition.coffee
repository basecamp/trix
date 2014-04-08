#= require trix/models/text

class Trix.Composition
  constructor: (@text = new Trix.Text) ->
    @text.delegate = this
    @currentAttributes = {}

  # Text delegate

  didEditText: (text) ->
    @delegate?.compositionDidChangeText?(this, @text)

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.replaceTextAtRange(text, selectedRange)
    else
      position = @getPosition()
      @text.insertTextAtPosition(text, position)

    @requestPosition(position + (if updatePosition then text.getLength() else 0))

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, options)

  insertAttachment: (attachment, options) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
    @insertText(text, options)

  insertHTML: (html, options) ->
    text = Trix.Text.fromHTML(html)
    @insertText(text, options)

  insertFile: (file, options) ->
    if handler = @delegate?.attachmentHandler
      attachment = Trix.Attachment.forFile(file)

      callback = (attributes) =>
        attributes[key] = value for key, value of attachment.attributes when not attributes[key]
        newAttachment = new Trix.Attachment attributes
        @text.replaceAttachment(attachment.id, newAttachment)

      unless handler(attachment.file, callback) is false
        @insertAttachment(attachment, options)

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
    selectedRange = @getSelectedRange() ? [0, 0]
    @text.getTextAtRange(selectedRange)


  # Current attributes

  inheritableAttributes =
    for key, value of Trix.attributes when value.inheritable
      key

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

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

  # Selection freezing

  freezeSelection: ->
    @setCurrentAttribute("frozen", true)

  thawSelection: ->
    @setCurrentAttribute("frozen", false)

  hasFrozenSelection: ->
    @hasCurrentAttribute("frozen")

  # Position and selected range

  getPosition: ->
    if range = @selectionDelegate?.getSelectedRangeOfComposition?(this)
      [start, end] = range
      start if start is end

  requestPosition: (position) ->
    @requestSelectedRange([position, position])

  requestPositionAtPoint: (point) ->
    if range = @selectionDelegate?.getRangeOfCompositionAtPoint?(this, point)
      @requestSelectedRange(range)

  getSelectedRange: ->
    if range = @selectionDelegate?.getSelectedRangeOfComposition?(this)
      [start, end] = range
      range unless start is end

  requestSelectedRange: ([start, end]) ->
    length = @text.getLength()
    range = [clamp(start, 0, length), clamp(end, 0, length)]
    @selectionDelegate?.compositionDidRequestSelectionOfRange?(this, range)

  clamp = (value, floor, ceiling) ->
    Math.max(floor, Math.min(ceiling, value))
