#= require trix/models/document
#= require trix/models/attachment_manager
#= require trix/utilities/helpers

{countGraphemeClusters, defer} = Trix.Helpers

class Trix.Composition
  constructor: (@document = new Trix.Document, config) ->
    @document.delegate = this
    @text = @document.textList.texts[0]

    @currentAttributes = {}

    @attachments = new Trix.AttachmentManager this
    @attachments.delegate = config?.delegate
    @attachments.reset()

  # Snapshots

  createSnapshot: ->
    text: @getText()
    selectedRange: @getInternalSelectedRange()

  restoreSnapshot: ({text, selectedRange}) ->
    @text.replaceText(text)
    @requestSelectedRange(selectedRange)

  # Document delegate

  didEditDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(this, @document)
    defer => @attachments.reset()

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    if selectedRange = @getSelectedRange()
      location = selectedRange[0]
      @document.replaceTextAtLocationRange(text, selectedRange)
    else
      location = @getLocation()
      @document.insertTextAtLocation(text, location)

    location.position += text.getLength() if updatePosition
    @requestPosition(location)

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, options)

  insertHTML: (html, options) ->
    text = Trix.Text.fromHTML(html)
    @insertText(text, options)

  replaceHTML: (html) ->
    @preserveSelectionEndPoint =>
      text = Trix.Text.fromHTML(html)
      @text.replaceText(text)

  insertFile: (file) ->
    if attachment = @attachments.create(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteFromCurrentPosition: (distance = -1) ->
    unless range = @getSelectedRange()
      position = @getLocation()
      offset = position + distance
      range = if distance < 0 then [offset, position] else [position, offset]

    @text.removeTextAtRange(range)
    @requestPosition(range[0])

  deleteBackward: ->
    distance = 1

    if (position = @getLocation())?
      while (leftPosition = position - distance - 1) >= 0
        string = @text.getStringAtRange([leftPosition, position])
        if countGraphemeClusters(string) is 1 or countGraphemeClusters("n#{string}") is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance * -1)

  deleteForward: ->
    distance = 1

    if (position = @getLocation())?
      while (rightPosition = position + distance + 1) <= @text.getLength()
        string = @text.getStringAtRange([position, rightPosition])
        if countGraphemeClusters(string) is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance)

  deleteWordBackward: ->
    if @getSelectedRange()
      @deleteBackward()
    else
      position = @getLocation()
      stringBeforePosition = @text.getStringAtRange([0, position])
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)
      @deleteFromCurrentPosition(positionBeforeLastWord - position)

  moveTextFromRange: (range) ->
    position = @getLocation()
    @text.moveTextFromRangeToPosition(range, position)
    @requestPosition(position)

  getTextFromSelection: ->
    selectedRange = @getSelectedRange() ? [0, 0]
    @text.getTextAtRange(selectedRange)

  # Attachment owner protocol

  getAttachments: ->
    @text.getAttachments()

  updateAttachment: (id, attributes) ->
    if attachment = @attachments.get(id)
      @text.edit -> attachment.setAttributes(attributes)

  removeAttachment: (id) ->
    if attachment = @attachments.get(id)
      range = @text.getRangeOfAttachment(attachment)
      @text.removeTextAtRange(range)

  # Current attributes

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

    else if (position = @getLocation())?
      @currentAttributes = {}
      attributes = @text.getAttributesAtPosition(position)
      attributesLeft = @text.getAttributesAtPosition(position - 1)

      for key, value of attributesLeft
        if value is attributes[key] or key in inheritableAttributes()
          @currentAttributes[key] = value

      @notifyDelegateOfCurrentAttributesChange()

  inheritableAttributes = ->
    for key, value of Trix.attributes when value.inheritable
      key

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

  getLocation: ->
    if range = @getInternalSelectedRange()
      [start, end] = range
      start if start is end

  requestPosition: (position) ->
    @requestSelectedRange([position, position])

  requestPositionAtPoint: (point) ->
    if range = @selectionDelegate?.getRangeOfCompositionAtPoint?(this, point)
      @requestSelectedRange(range)

  preserveSelectionEndPoint: (block) ->
    point = @selectionDelegate?.getPointAtEndOfCompositionSelection?(this)
    block()
    @requestPositionAtPoint(point) if point?

  getSelectedRange: ->
    if range = @getInternalSelectedRange()
      [start, end] = range
      range unless start is end

  requestSelectedRange: (range) ->
    if range?
      #[start, end] = range
      #length = @text.getLength()
      #range = [clamp(start, 0, length), clamp(end, 0, length)]
      @selectionDelegate?.compositionDidRequestSelectionOfRange?(this, range)

  # Private

  getText: ->
    @text.copy()

  getInternalSelectedRange: ->
    @selectionDelegate?.getSelectedRangeOfComposition?(this)

  clamp = (value, floor, ceiling) ->
    Math.max(floor, Math.min(ceiling, value))
