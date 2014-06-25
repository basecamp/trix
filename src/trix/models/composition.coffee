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
    document: @getDocument()
    selectedRange: @getLocationRange()

  restoreSnapshot: ({document, selectedRange}) ->
    @document.replaceDocument(document)
    @setLocationRange(selectedRange)

  # Document delegate

  didEditDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(this, @document)
    defer => @attachments.reset()

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    @delegate?.compositionWillSetLocationRange?() if updatePosition

    range = @getLocationRange()
    @document.insertTextAtLocationRange(text, range)

    if updatePosition
      {index, offset} = range.start
      offset += text.getLength()
      @setLocationRange({index, offset})

  insertDocument: (document) ->
    @delegate?.compositionWillSetLocationRange?()
    range = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, range)

    index = range.index + (blockLength = document.blockList.length)
    offset = document.getBlockAtIndex(blockLength - 1).text.getLength()
    @setLocationRange({index, offset})

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, options)

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html, {@attachments})
    @insertDocument(document)

  replaceHTML: (html) ->
    @preserveSelection =>
      document = Trix.Document.fromHTML(html, {@attachments})
      @document.replaceDocument(document)

  insertFile: (file) ->
    if attachment = @attachments.create(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteFromCurrentPosition: (distance = -1) ->
    @delegate?.compositionWillSetLocationRange?()
    range = @getLocationRange()

    if range.isCollapsed()
      {index, offset} = range
      offset += distance

      if distance < 0
        if offset < 0
          index--
          offset += @document.getTextAtIndex(index).getLength() + 1

        start = {index, offset}
        end = range.start
      else
        if offset > (textLength = @document.getTextAtIndex(index).getLength())
          index++
          offset -= textLength + 1

        start = range.start
        end = {index, offset}

      range = new Trix.LocationRange start, end

    @document.removeTextAtLocationRange(range)
    @setLocationRange(range.collapse())

  deleteBackward: ->
    distance = 1
    range = @getLocationRange()

    if range.isCollapsed() and range.offset > 0
      while (leftPosition = range.offset - distance - 1) >= 0
        string = @document.getTextAtIndex(range.index).getStringAtRange([leftPosition, range.offset])
        if countGraphemeClusters(string) is 1 or countGraphemeClusters("n#{string}") is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance * -1)

  deleteForward: ->
    distance = 1
    range = @getLocationRange()

    if range.isCollapsed()
      text = @document.getTextAtIndex(range.index)
      textLength = text.getLength()
      while (rightPosition = range.offset + distance + 1) <= textLength
        string = text.getStringAtRange([range.offset, rightPosition])
        if countGraphemeClusters(string) is 1
          distance++
        else
          break

    @deleteFromCurrentPosition(distance)

  deleteWordBackward: ->
    if @getLocationRange()
      @deleteBackward()
    else
      range = @getLocationRange()
      text = @getTextAtIndex(range.index)
      # TODO: delete across blocks
      stringBeforePosition = text.getStringAtRange([0, range.offset])
      # TODO: \b is not unicode compatible
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)
      @deleteFromCurrentPosition(positionBeforeLastWord - position)

  moveTextFromLocationRange: (locationRange) ->
    @delegate?.compositionWillSetLocationRange?()
    position = @getPosition()
    @document.moveTextFromLocationRangeToPosition(locationRange, position)
    @setPosition(position)

  getTextFromSelection: ->
    # TODO: get text(s) spanning blocks
    if range = @getLocationRange()
      if range[0].index is range[1].index
        text = @getTextAtIndex(range[0].index)
        text.getTextAtRange([range[0].offset, range[1].offset])

  # Attachment owner protocol

  getAttachments: ->
    @document.getAttachments()

  updateAttachment: (id, attributes) ->
    if attachment = @attachments.get(id)
      @document.edit -> attachment.setAttributes(attributes)

  removeAttachment: (id) ->
    if attachment = @attachments.get(id)
      locationRange = @document.getLocationRangeOfAttachment(attachment)
      @document.removeTextAtLocationRange(locationRange)

  # Current attributes

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

  toggleCurrentAttribute: (attributeName) ->
    value = not @currentAttributes[attributeName]
    @setCurrentAttribute(attributeName, value)

  setCurrentAttribute: (attributeName, value) ->
    range = @getLocationRange()

    if value
      @document.addAttributeAtLocationRange(attributeName, value, range)
      @currentAttributes[attributeName] = value
    else
      @document.removeAttributeAtLocationRange(attributeName, range)
      delete @currentAttributes[attributeName]

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttributes: ->
    @currentAttributes =
      if range = @getLocationRange()
        @document.getCommonAttributesAtLocationRange(range)
      else
        {}

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

  # Location range and selection

  getLocationRange: ->
    @selectionDelegate?.getLocationRange?()

  setLocationRange: (locationRangeOrStart, end) ->
    @selectionDelegate?.setLocationRange?(locationRangeOrStart, end)

  setLocationRangeFromPoint: (point) ->
    @selectionDelegate?.setLocationRangeFromPoint?(point)

  getPosition: ->
    range = @getLocationRange()
    @document.rangeFromLocationRange(range)[0]

  setPosition: (position) ->
    range = @document.locationRangeFromPosition(position)
    @setLocationRange(range)

  preserveSelection: (block) ->
    @selectionDelegate?.preserveSelection?(block) ? block()

  expandSelectionForEditing: ->
    for key, value of Trix.attributes when value.parent
      if @hasCurrentAttribute(key)
        @expandLocationRangeAroundCommonAttribute(key)
        break

  expandLocationRangeAroundCommonAttribute: (attributeName) ->
    range = @getLocationRange()

    if range.isInSingleIndex()
      {index} = range
      text = @document.getTextAtIndex(index)
      textRange = [range.start.offset, range.end.offset]
      [left, right] = text.getExpandedRangeForAttributeAtRange(attributeName, textRange)

      @setLocationRange({offset: left, index}, {offset: right, index})

  # Private

  getDocument: ->
    @document.copy()
