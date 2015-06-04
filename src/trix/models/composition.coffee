#= require trix/models/document

{arraysAreEqual} = Trix

class Trix.Composition extends Trix.BasicObject
  constructor: (@document = new Trix.Document) ->
    @document.delegate = this
    @currentAttributes = {}

  # Snapshots

  createSnapshot: ->
    document: @getDocument()
    selectedRange: @getLocationRange()

  restoreSnapshot: ({document, selectedRange}) ->
    @document.replaceDocument(document)
    @setLocationRange(selectedRange)
    @delegate?.compositionDidRestoreSnapshot?()

  # Document delegate

  didEditDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(@document)

  documentDidAddAttachment: (document, attachment) ->
    @delegate?.compositionDidAddAttachment?(attachment)

  documentDidEditAttachment: (document, attachment) ->
    @delegate?.compositionDidEditAttachment?(attachment)

  documentDidRemoveAttachment: (document, attachment) ->
    @delegate?.compositionDidRemoveAttachment?(attachment)

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertTextAtLocationRange(text, locationRange)

    endPosition = position + text.getLength()
    endLocation = @document.locationFromPosition(endPosition)
    @setLocation(endLocation) if updatePosition

    insertedLocationRange = locationRange.copyWithEndLocation(endLocation)
    @notifyDelegateOfInsertionAtLocationRange(insertedLocationRange)

  insertDocument: (document = Trix.Document.fromString("")) ->
    startPosition = @getPosition()
    locationRange = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, locationRange)

    endPosition = startPosition + document.getLength() - 1
    @setPosition(endPosition)

    insertedLocationRange = @document.locationRangeFromRange([startPosition, endPosition])
    @notifyDelegateOfInsertionAtLocationRange(insertedLocationRange)

  insertString: (string, options) ->
    attributes = @getCurrentTextAttributes()
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @insertText(text, options)

  insertBlockBreak: ->
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertBlockBreakAtLocationRange(locationRange)

    endPosition = position + 1
    endLocation = @document.locationFromPosition(endPosition)
    @setLocation(endLocation)

    insertedLocationRange = locationRange.copyWithEndLocation(endLocation)
    @notifyDelegateOfInsertionAtLocationRange(insertedLocationRange)

  breakFormattedBlock: ->
    [startPosition, endPosition] = @getRange()
    locationRange = @document.locationRangeFromRange([startPosition - 1, endPosition])

    {index, offset} = locationRange.end
    block = @document.getBlockAtIndex(index)

    if block.getBlockBreakPosition() is offset
      @document.removeTextAtLocationRange(locationRange)
      locationRange = @document.locationRangeFromPosition(startPosition)
    else
      nextCharacter = block.text.getStringAtRange([offset, offset + 1])
      if nextCharacter is "\n"
        locationRange = @document.locationRangeFromRange([startPosition - 1, endPosition + 1])

    document = new Trix.Document [block.removeLastAttribute().copyWithoutText()]
    @document.insertDocumentAtLocationRange(document, locationRange)
    @setPosition(startPosition)

  insertLineBreak: ->
    locationRange = @getLocationRange()
    {index, offset} = locationRange.end
    block = @document.getBlockAtIndex(index)

    if block.hasAttributes()
      attributes = block.getAttributes()
      blockConfig = Trix.config.blockAttributes[block.getLastAttribute()]
      if blockConfig?.listAttribute
        if block.isEmpty()
          @removeLastBlockAttribute()
        else
          @insertBlockBreak()
      else
        if block.isEmpty()
          @removeLastBlockAttribute()
        else if block.text.getStringAtRange([offset - 1, offset]) is "\n"
          @breakFormattedBlock()
        else
          @insertString("\n")
    else
      @insertString("\n")

  pasteDocument: (document) ->
    blockAttributes = @getBlock().getAttributes()
    baseBlockAttributes = document.getBaseBlockAttributes()
    trailingBlockAttributes = blockAttributes.slice(-baseBlockAttributes.length)

    if arraysAreEqual(baseBlockAttributes, trailingBlockAttributes)
      leadingBlockAttributes = blockAttributes.slice(0, -baseBlockAttributes.length)
      formattedDocument = document.copyWithBaseBlockAttributes(leadingBlockAttributes)
    else
      formattedDocument = document.copy(consolidateBlocks: true).copyWithBaseBlockAttributes(blockAttributes)

    blockCount = formattedDocument.getBlockCount()
    firstBlock = formattedDocument.getBlockAtIndex(0)

    if blockCount is 1 and arraysAreEqual(blockAttributes, firstBlock.getAttributes())
      @insertText(firstBlock.getTextWithoutBlockBreak())
    else
      if firstBlock.hasAttributes()
        @insertDocument(formattedDocument)
      else
        position = @getPosition()
        text = firstBlock.getTextWithoutBlockBreak()
        @document.insertTextAtLocationRange(text, @getLocationRange())
        position += text.getLength()

        if blockCount > 1
          formattedDocument = new Trix.Document formattedDocument.getBlocks().slice(1)
          locationRange = @document.locationRangeFromPosition(position)
          @document.insertDocumentAtLocationRange(formattedDocument, locationRange)
          position += formattedDocument.getLength()

        @setPosition(position)

  pasteHTML: (html) ->
    document = Trix.Document.fromHTML(html)
    @pasteDocument(document)

  replaceHTML: (html) ->
    document = Trix.Document.fromHTML(html).copyUsingObjectsFromDocument(@document)
    unless document.isEqualTo(@document)
      @preserveSelection =>
        @document.replaceDocument(document)

  insertFile: (file) ->
    if @delegate?.compositionShouldAcceptFile(file)
      attachment = Trix.Attachment.attachmentForFile(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteInDirection: (direction) ->
    locationRange = @getLocationRange()

    if locationRange.isCollapsed()
      if direction is "backward" and locationRange.offset is 0
        if @canDecreaseBlockAttributeLevel()
          if @isEditingListItem()
            @decreaseBlockAttributeLevel() while @isEditingListItem()
          else
            @decreaseBlockAttributeLevel()
            @setLocationRange(locationRange)
            return

      range = @getExpandedRangeInDirection(direction)
      locationRange = @document.locationRangeFromRange(range)

      if direction is "backward"
        attachment = @getAttachmentAtLocationRange(locationRange)

    if attachment
      @setLocationRange(locationRange)
      @editAttachment(attachment)
    else
      @document.removeTextAtLocationRange(locationRange)
      @setLocationRange(locationRange.collapse())

  moveTextFromLocationRange: (locationRange) ->
    position = @getPosition()
    @document.moveTextFromLocationRangeToPosition(locationRange, position)
    @setPosition(position)

  removeAttachment: (attachment) ->
    if locationRange = @document.getLocationRangeOfAttachment(attachment)
      @stopEditingAttachment()
      @document.removeTextAtLocationRange(locationRange)
      @setLocationRange(locationRange.collapse())

  removeLastBlockAttribute: ->
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.end.index)
    @removeCurrentAttribute(block.getLastAttribute())
    @setLocationRange(locationRange.collapse())

  # Current attributes

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

  toggleCurrentAttribute: (attributeName) ->
    if value = not @currentAttributes[attributeName]
      @setCurrentAttribute(attributeName, value)
    else
      @removeCurrentAttribute(attributeName)

  canSetCurrentAttribute: (attributeName) ->
    switch attributeName
      when "href"
        not @selectionContainsAttachmentWithAttribute(attributeName)
      else
        true

  setCurrentAttribute: (attributeName, value) ->
    if Trix.config.blockAttributes[attributeName]
      @setBlockAttribute(attributeName, value)
    else
      @setTextAttribute(attributeName, value)
      @currentAttributes[attributeName] = value
      @notifyDelegateOfCurrentAttributesChange()

  setTextAttribute: (attributeName, value) ->
    return unless locationRange = @getLocationRange()
    if locationRange.isCollapsed()
      if attributeName is "href"
        text = Trix.Text.textForStringWithAttributes(value, href: value)
        @insertText(text)
    else
      @document.addAttributeAtLocationRange(attributeName, value, locationRange)

  setBlockAttribute: (attributeName, value) ->
    return unless locationRange = @getLocationRange()
    range = @document.rangeFromLocationRange(locationRange)
    @document.applyBlockAttributeAtLocationRange(attributeName, value, locationRange)
    @setRange(range)

  removeCurrentAttribute: (attributeName) ->
    if Trix.config.blockAttributes[attributeName]
      @removeBlockAttribute(attributeName)
      @updateCurrentAttributes()
    else
      @removeTextAttribute(attributeName)
      delete @currentAttributes[attributeName]
      @notifyDelegateOfCurrentAttributesChange()

  removeTextAttribute: (attributeName) ->
    return unless locationRange = @getLocationRange()
    unless locationRange.isCollapsed()
      @document.removeAttributeAtLocationRange(attributeName, locationRange)

  removeBlockAttribute: (attributeName) ->
    return unless locationRange = @getLocationRange()
    @document.removeAttributeAtLocationRange(attributeName, locationRange)

  increaseBlockAttributeLevel: ->
    if attribute = @getBlock()?.getLastAttribute()
      @setCurrentAttribute(attribute)

  decreaseBlockAttributeLevel: ->
    if attribute = @getBlock()?.getLastAttribute()
      @removeCurrentAttribute(attribute)

  canIncreaseBlockAttributeLevel: ->
    return unless block = @getBlock()
    return unless attribute = block.getLastAttribute()
    return unless config = Trix.config.blockAttributes[attribute]
    if config.listAttribute
      if previousBlock = @getPreviousBlock()
        previousBlock.getAttributeAtLevel(block.getAttributeLevel()) is attribute
    else
      config.nestable

  canDecreaseBlockAttributeLevel: ->
    @getBlock()?.getAttributeLevel() > 0

  isEditingListItem: ->
    if attribute = @getBlock()?.getLastAttribute()
      Trix.config.blockAttributes[attribute].listAttribute

  updateCurrentAttributes: ->
    @currentAttributes =
      if locationRange = @getLocationRange(ignoreLock: true)
        @document.getCommonAttributesAtLocationRange(locationRange)
      else
        {}

    @notifyDelegateOfCurrentAttributesChange()

  getCurrentTextAttributes: ->
    attributes = {}
    attributes[key] = value for key, value of @currentAttributes when Trix.config.textAttributes[key]
    attributes

  # Selection freezing

  freezeSelection: ->
    @setCurrentAttribute("frozen", true)

  thawSelection: ->
    @removeCurrentAttribute("frozen")

  hasFrozenSelection: ->
    @hasCurrentAttribute("frozen")

  # Location range

  @proxyMethod "getSelectionManager().getLocationRange"
  @proxyMethod "getSelectionManager().setLocationRangeFromPoint"
  @proxyMethod "getSelectionManager().preserveSelection"
  @proxyMethod "getSelectionManager().locationIsCursorTarget"
  @proxyMethod "getSelectionManager().selectionIsExpanded"
  @proxyMethod "delegate?.getSelectionManager"

  getRange: ->
    locationRange = @getLocationRange()
    @document.rangeFromLocationRange(locationRange)

  setRange: (range) ->
    locationRange = @document.locationRangeFromRange(range)
    @setLocationRange(locationRange)

  getPosition: ->
    @getRange()[0]

  setPosition: (position) ->
    location = @document.locationFromPosition(position)
    @setLocation(location)

  setLocation: (location) ->
    locationRange = new Trix.LocationRange location
    @setLocationRange(locationRange)

  setLocationRange: ->
    @delegate?.compositionDidRequestLocationRange?(arguments...)

  getExpandedRangeInDirection: (direction) ->
    range = @getRange()
    if direction is "backward"
      range[0] = @translateUTF16PositionFromOffset(range[0], -1)
    else
      range[1] = @translateUTF16PositionFromOffset(range[1], 1)
    range

  # Selection

  setSelectionForLocationRange: ->
    @getSelectionManager().setLocationRange(arguments...)

  moveCursorInDirection: (direction) ->
    if @editingAttachment
      locationRange = @document.getLocationRangeOfAttachment(@editingAttachment)
    else
      originalLocationRange = @getLocationRange()
      expandedRange = @getExpandedRangeInDirection(direction)
      locationRange = @document.locationRangeFromRange(expandedRange)
      canEditAttachment = not locationRange.isEqualTo(originalLocationRange)

    if direction is "backward"
      @setSelectionForLocationRange(locationRange.start)
    else
      @setSelectionForLocationRange(locationRange.end)

    if canEditAttachment
      if attachment = @getAttachmentAtLocationRange(locationRange)
        @editAttachment(attachment)

  expandSelectionInDirection: (direction) ->
    range = @getExpandedRangeInDirection(direction)
    locationRange = @document.locationRangeFromRange(range)
    @setSelectionForLocationRange(locationRange)

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandSelectionAroundCommonAttribute("href")

  expandSelectionAroundCommonAttribute: (attributeName) ->
    locationRange = @getLocationRange()

    if locationRange.isInSingleIndex()
      {index} = locationRange
      text = @document.getTextAtIndex(index)
      textRange = [locationRange.start.offset, locationRange.end.offset]
      [left, right] = text.getExpandedRangeForAttributeAtRange(attributeName, textRange)

      @setSelectionForLocationRange([index, left], [index, right])

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if locationRange = @getLocationRange()
      for attachment in @document.getDocumentAtLocationRange(locationRange).getAttachments()
        return true if attachment.hasAttribute(attributeName)
      false

  selectionIsInCursorTarget: ->
    @editingAttachment or @locationIsCursorTarget(@getLocationRange().start)

  getSelectedDocument: ->
    if locationRange = @getLocationRange()
      @document.getDocumentAtLocationRange(locationRange)

  # Attachment editing

  editAttachment: (attachment) ->
    return if attachment is @editingAttachment
    @stopEditingAttachment()
    @editingAttachment = attachment
    @delegate?.compositionDidStartEditingAttachment(@editingAttachment)

  stopEditingAttachment: ->
    return unless @editingAttachment
    @delegate?.compositionDidStopEditingAttachment(@editingAttachment)
    delete @editingAttachment

  canEditAttachmentCaption: ->
    @editingAttachment?.isPreviewable()

  # Private

  getDocument: ->
    @document.copy()

  getPreviousBlock: ->
    if locationRange = @getLocationRange()
      {index} = locationRange
      @document.getBlockAtIndex(index - 1) if index > 0

  getBlock: ->
    if locationRange = @getLocationRange()
      @document.getBlockAtIndex(locationRange.index)

  getAttachmentAtLocationRange: (locationRange) ->
    document = @document.getDocumentAtLocationRange(locationRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  notifyDelegateOfInsertionAtLocationRange: (locationRange) ->
    @delegate?.compositionDidPerformInsertionAtLocationRange?(locationRange)

  translateUTF16PositionFromOffset: (position, offset) ->
    utf16string = @document.toUTF16String()
    utf16position = utf16string.offsetFromUCS2Offset(position)
    utf16string.offsetToUCS2Offset(utf16position + offset)
