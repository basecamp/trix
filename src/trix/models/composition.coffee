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
    selectedRange: @getLocation()

  restoreSnapshot: ({document, selectedRange}) ->
    @document.replaceDocument(document)
    @setLocation(selectedRange)

  # Document delegate

  didEditDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(this, @document)
    defer => @attachments.reset()

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    location = @getLocation()
    @document.insertTextAtLocation(text, location)

    {index, position} = location.start
    position += text.getLength() if updatePosition
    @setLocation(new Trix.Location {index, position})

  insertDocument: (document) ->
    location = @getLocation()
    @document.insertDocumentAtLocation(document, location)

    blockLength = document.blockList.blocks.length
    lastText = document.blockList.getBlockAtIndex(blockLength - 1).text

    index = location.index + blockLength
    position = lastText.getLength()
    @setLocation(new Trix.Location {index, position})

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, options)

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html)
    @insertDocument(document)

  replaceHTML: (html) ->
    @preserveSelectionEndPoint =>
      document = Trix.Document.fromHTML(html)
      @document.replaceDocument(document)

  insertFile: (file) ->
    if attachment = @attachments.create(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteFromCurrentPosition: (distance = -1) ->
    location = @getLocation()

    if location.isCollapsed()
      {index, position} = location
      position += distance

      if distance < 0
        if position < 0
          index--
          position += @document.getTextAtIndex(index).getLength() + 1

        start = {index, position}
        end = location.start
      else
        if position > (textLength = @document.getTextAtIndex(index).getLength())
          index++
          position -= textLength + 1

        start = location.start
        end = {index, position}

      location = new Trix.Location start, end

    @document.removeTextAtLocation(location)
    @setLocation(location.collapse())

  deleteBackward: ->
    distance = 1
    location = @getLocation()

    if location.isCollapsed() and location.position > 0
      while (leftPosition = location.position - distance - 1) >= 0
        string = @document.getTextAtIndex(location.index).getStringAtRange([leftPosition, location.position])
        if countGraphemeClusters(string) is 1 or countGraphemeClusters("n#{string}") is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance * -1)

  deleteForward: ->
    distance = 1
    location = @getLocation()

    if location.isCollapsed()
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
    if @getLocation()
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
    if location = @getLocation()
      if location[0].index is location[1].index
        text = @getTextAtIndex(location[0].index)
        text.getTextAtRange([location[0].position, location[1].position])

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
    unless location = @getLocation()
      location = @getLocation()
      location = [location, location]

    if value
      @document.addAttributeAtLocation(attributeName, value, location)
      @currentAttributes[attributeName] = value
    else
      @document.removeAttributeAtLocation(attributeName, location)
      delete @currentAttributes[attributeName]

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttributes: ->
    if location = @getLocation()
      @currentAttributes = @document.getCommonAttributesAtLocation(location)

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

  # Location

  getLocation: ->
    @selectionDelegate?.getLocation?()

  setLocation: (location) ->
    @selectionDelegate?.setLocation?(location)

  requestPositionAtPoint: (point) ->
    if range = @selectionDelegate?.getRangeOfCompositionAtPoint?(this, point)
      @requestSelectedRange(range)

  preserveSelectionEndPoint: (block) ->
    point = @selectionDelegate?.getPointAtEndOfCompositionSelection?(this)
    block()
    @requestPositionAtPoint(point) if point?

  expandSelectionForEditing: ->
    for key, value of Trix.attributes when value.parent
      if @hasCurrentAttribute(key)
        @expandLocationAroundCommonAttribute(key)
        break

  expandLocationAroundCommonAttribute: (attributeName) ->
    [left, right] = @documentView.getSelectedRange()
    originalLeft = left
    length = @text.getLength()

    left-- while left > 0 and @text.getCommonAttributesAtRange([left - 1, right])[attributeName]
    right++ while right < length and @text.getCommonAttributesAtRange([originalLeft, right + 1])[attributeName]

    @documentView.setSelectedRange([left, right])

  # Private

  getDocument: ->
    # TODO
    @document.copy?()
