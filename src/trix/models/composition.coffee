#= require trix/models/document
#= require trix/models/attachment_manager
#= require trix/utilities/helpers

{countGraphemeClusters, defer} = Trix.Helpers

class Trix.Composition
  constructor: (@document = new Trix.Document, config) ->
    @document.delegate = this
    @currentAttributes = {}

    @attachments = new Trix.AttachmentManager this
    @attachments.delegate = config?.delegate
    @attachments.reset()

  # Snapshots

  createSnapshot: ->
    text: @getDocument()
    selectedRange: @getInternalSelectedRange()

  restoreSnapshot: ({document, selectedRange}) ->
    # TODO
    @document.replaceDocument(document)
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
      # TODO
      document = Trix.Document.fromHTML(html)
      @document.replaceDocument(document)

  insertFile: (file) ->
    if attachment = @attachments.create(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteFromCurrentPosition: (distance = -1) ->
    unless range = @getSelectedRange()
      {index, position} = location = @getLocation()
      position += distance

      if distance < 0
        if position < 0
          index--
          position += @document.getTextAtIndex(index).getLength() + 1

        startLocation = {index, position}
        endLocation = location
      else
        if position > (textLength = @document.getTextAtIndex(index).getLength())
          index++
          position -= textLength + 1

        startLocation = location
        endLocation = {index, position}

      range = [startLocation, endLocation]

    @document.removeTextAtLocationRange(range)
    @requestPosition(range[0])

  deleteBackward: ->
    distance = 1

    if location = @getLocation()
      if location.position > 0
        while (leftPosition = location.position - distance - 1) >= 0
          string = @document.getTextAtIndex(location.index).getStringAtRange([leftPosition, location.position])
          if countGraphemeClusters(string) is 1 or countGraphemeClusters("n#{string}") is 1
            distance++
          else
            break

    @deleteFromCurrentPosition(distance * -1)

  deleteForward: ->
    distance = 1

    if location = @getLocation()
      text = @document.getTextAtIndex(location.index)
      textLength = text.getLength()
      while (rightPosition = location.position + distance + 1) <= textLength
        string = text.getStringAtRange([location.position, rightPosition])
        if countGraphemeClusters(string) is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance)

  deleteWordBackward: ->
    if @getSelectedRange()
      @deleteBackward()
    else
      location = @getLocation()
      text = @getTextAtIndex(location.index)
      # TODO: delete across blocks
      stringBeforePosition = text.getStringAtRange([0, location.position])
      # TODO: \b is not unicode compatible
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)
      @deleteFromCurrentPosition(positionBeforeLastWord - position)

  moveTextFromRange: (range) ->
    location = @getLocation()
    # TODO: move selection spanning blocks
    text = @getTextAtIndex(index)
    text.moveTextFromRangeToPosition(range, position)
    @requestPosition(position)

  getTextFromSelection: ->
    # TODO: get text(s) spanning blocks
    if locationRange = @getSelectedRange()
      if locationRange[0].index is locationRange[1].index
        text = @getTextAtIndex(locationRange[0].index)
        text.getTextAtRange([locationRange[0].position, locationRange[1].position])

  # Attachment owner protocol

  getAttachments: ->
    @document.getAttachments()

  updateAttachment: (id, attributes) ->
    if attachment = @attachments.get(id)
      {text} = @document.getTextAndRangeOfAttachment(attachment)
      text.edit -> attachment.setAttributes(attributes)

  removeAttachment: (id) ->
    if attachment = @attachments.get(id)
      {text, range} = @document.getTextAndRangeOfAttachment(attachment)
      text.removeTextAtRange(range)

  # Current attributes

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

  toggleCurrentAttribute: (attributeName) ->
    value = not @currentAttributes[attributeName]
    @setCurrentAttribute(attributeName, value)

  setCurrentAttribute: (attributeName, value) ->
    unless locationRange = @getSelectedRange()
      location = @getLocation()
      locationRange = [location, location]

    if value
      @document.addAttributeAtLocationRange(attributeName, value, locationRange)
      @currentAttributes[attributeName] = value
    else
      @document.removeAttributeAtLocationRange(attributeName, locationRange)
      delete @currentAttributes[attributeName]

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttributes: ->
    if locationRange = @getSelectedRange()
      @currentAttributes = @document.getCommonAttributesAtLocationRange(locationRange)

    else if location = @getLocation()
      block = @document.getBlockAtIndex(location.index)
      @currentAttributes = block.getAttributes()

      attributes = block.text.getAttributesAtPosition(location.position)
      attributesLeft = block.text.getAttributesAtPosition(location.position - 1)

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

  getDocument: ->
    # TODO
    @document.copy()

  getInternalSelectedRange: ->
    @selectionDelegate?.getSelectedRangeOfComposition?(this)

  clamp = (value, floor, ceiling) ->
    Math.max(floor, Math.min(ceiling, value))
