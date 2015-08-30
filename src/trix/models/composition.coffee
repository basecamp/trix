#= require trix/models/document

{normalizeRange, rangesAreEqual} = Trix

class Trix.Composition extends Trix.BasicObject
  constructor: ->
    @document = new Trix.Document
    @currentAttributes = {}

  setDocument: (document) ->
    unless document.isEqualTo(@document)
      @document = document
      @delegate?.compositionDidChangeDocument(document)

  # Snapshots

  createSnapshot: ->
    document: @getDocument()
    selectedRange: @getSelectedRange()

  restoreSnapshot: ({document, selectedRange}) ->
    @setDocument(document)
    @setSelectedRange(selectedRange)
    @delegate?.compositionDidRestoreSnapshot?()

  # Document delegate

  documentDidAddAttachment: (document, attachment) ->
    @delegate?.compositionDidAddAttachment?(attachment)

  documentDidEditAttachment: (document, attachment) ->
    @delegate?.compositionDidEditAttachment?(attachment)

  documentDidRemoveAttachment: (document, attachment) ->
    @delegate?.compositionDidRemoveAttachment?(attachment)

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    selectedRange = @getSelectedRange()
    @setDocument(@document.insertTextAtRange(text, selectedRange))

    startPosition = selectedRange[0]
    endPosition = startPosition + text.getLength()

    @setSelectedRange(endPosition) if updatePosition
    @notifyDelegateOfInsertionAtRange([startPosition, endPosition])

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = new Trix.Document) ->
    selectedRange = @getSelectedRange()
    @setDocument(@document.insertDocumentAtRange(document, selectedRange))

    startPosition = selectedRange[0]
    endPosition = startPosition + document.getLength()

    @setSelectedRange(endPosition)
    @notifyDelegateOfInsertionAtRange([startPosition, endPosition])

  insertString: (string, options) ->
    attributes = @getCurrentTextAttributes()
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @insertText(text, options)

  insertBlockBreak: ->
    selectedRange = @getSelectedRange()
    @setDocument(@document.insertBlockBreakAtRange(selectedRange))

    startPosition = selectedRange[0]
    endPosition = startPosition + 1

    @setSelectedRange(endPosition)
    @notifyDelegateOfInsertionAtRange([startPosition, endPosition])

  breakFormattedBlock: ->
    position = @getPosition()
    range = [position - 1, position]

    document = @document
    {index, offset} = document.locationFromPosition(position)
    block = document.getBlockAtIndex(index)

    if block.getBlockBreakPosition() is offset
      document = document.removeTextAtRange(range)
      range = [position, position]
    else
      if block.text.getStringAtRange([offset, offset + 1]) is "\n"
        range = [position - 1, position + 1]
      else
        position += 1

    newDocument = new Trix.Document [block.removeLastAttribute().copyWithoutText()]
    @setDocument(document.insertDocumentAtRange(newDocument, range))
    @setPosition(position)

  insertLineBreak: ->
    [startPosition, endPosition] = @getSelectedRange()
    startLocation = @document.locationFromPosition(startPosition)
    endLocation = @document.locationFromPosition(endPosition)
    block = @document.getBlockAtIndex(endLocation.index)

    if block.hasAttributes()
      if block.isListItem()
        if block.isEmpty()
          @decreaseListLevel()
          @setPosition(startPosition)
        else if startLocation.offset is 0
          document = new Trix.Document [block.copyWithoutText()]
          @insertDocument(document)
        else
          @insertBlockBreak()
      else
        if block.isEmpty()
          @removeLastBlockAttribute()
        else if block.text.getStringAtRange([endLocation.offset - 1, endLocation.offset]) is "\n"
          @breakFormattedBlock()
        else
          @insertString("\n")
    else
      @insertString("\n")

  pasteHTML: (html) ->
    startPosition = @getPosition()
    startLength = @document.getLength()

    document = Trix.Document.fromHTML(html)
    @setDocument(@document.mergeDocumentAtRange(document, @getSelectedRange()))

    endLength = @document.getLength()
    endPosition = startPosition + (endLength - startLength)

    @setPosition(endPosition)
    @notifyDelegateOfInsertionAtRange([endPosition, endPosition])

  replaceHTML: (html) ->
    document = Trix.Document.fromHTML(html).copyUsingObjectsFromDocument(@document)
    @preserveSelection =>
      @setDocument(document)

  insertFile: (file) ->
    if @delegate?.compositionShouldAcceptFile(file)
      attachment = Trix.Attachment.attachmentForFile(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteInDirection: (direction) ->
    range = [startPosition, endPosition] = @getSelectedRange()
    block = @getBlock()

    if startPosition is endPosition
      startLocation = @document.locationFromPosition(startPosition)
      if direction is "backward" and startLocation.offset is 0 and block.isEmpty()
        if @canDecreaseBlockAttributeLevel()
          if block.isListItem()
            @decreaseListLevel()
          else
            @decreaseBlockAttributeLevel()
          @setPosition(startPosition)
          return

      range = @getExpandedRangeInDirection(direction)

      if direction is "backward"
        attachment = @getAttachmentAtRange(range)

    if attachment
      @editAttachment(attachment)
      false
    else
      @setDocument(@document.removeTextAtRange(range))
      @setPosition(range[0])

  moveTextFromRange: (range) ->
    [position] = @getSelectedRange()
    @setDocument(@document.moveTextFromRangeToPosition(range, position))
    @setSelectedRange(position)

  removeAttachment: (attachment) ->
    if range = @document.getRangeOfAttachment(attachment)
      @stopEditingAttachment()
      @setDocument(@document.removeTextAtRange(range))
      @setSelectedRange(range[0])

  removeLastBlockAttribute: ->
    [startPosition, endPosition] = @getSelectedRange()
    block = @document.getBlockAtPosition(endPosition)
    @removeCurrentAttribute(block.getLastAttribute())
    @setSelectedRange(startPosition)

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
    return unless selectedRange = @getSelectedRange()
    [startPosition, endPosition] = selectedRange
    if startPosition is endPosition
      if attributeName is "href"
        text = Trix.Text.textForStringWithAttributes(value, href: value)
        @insertText(text)
    else
      @setDocument(@document.addAttributeAtRange(attributeName, value, selectedRange))

  setBlockAttribute: (attributeName, value) ->
    return unless selectedRange = @getSelectedRange()
    @setDocument(@document.applyBlockAttributeAtRange(attributeName, value, selectedRange))
    @setSelectedRange(selectedRange)

  removeCurrentAttribute: (attributeName) ->
    if Trix.config.blockAttributes[attributeName]
      @removeBlockAttribute(attributeName)
      @updateCurrentAttributes()
    else
      @removeTextAttribute(attributeName)
      delete @currentAttributes[attributeName]
      @notifyDelegateOfCurrentAttributesChange()

  removeTextAttribute: (attributeName) ->
    return unless selectedRange = @getSelectedRange()
    @setDocument(@document.removeAttributeAtRange(attributeName, selectedRange))

  removeBlockAttribute: (attributeName) ->
    return unless selectedRange = @getSelectedRange()
    @setDocument(@document.removeAttributeAtRange(attributeName, selectedRange))

  increaseBlockAttributeLevel: ->
    if attribute = @getBlock()?.getLastAttribute()
      @setCurrentAttribute(attribute)

  decreaseBlockAttributeLevel: ->
    if attribute = @getBlock()?.getLastAttribute()
      @removeCurrentAttribute(attribute)

  decreaseListLevel: ->
    [startPosition] = @getSelectedRange()
    {index} = @document.locationFromPosition(startPosition)
    endIndex = index
    attributeLevel = @getBlock().getAttributeLevel()

    while block = @document.getBlockAtIndex(endIndex + 1)
      break unless block.isListItem() and block.getAttributeLevel() > attributeLevel
      endIndex++

    startPosition = @document.positionFromLocation(index: index, offset: 0)
    endPosition = @document.positionFromLocation(index: endIndex, offset: 0)
    @setDocument(@document.removeLastListAttributeAtRange([startPosition, endPosition]))

  canIncreaseBlockAttributeLevel: ->
    return unless block = @getBlock()
    nestable = block.getConfig("nestable")
    if nestable?
      nestable
    else if block.isListItem()
      if previousBlock = @getPreviousBlock()
        level = block.getAttributeLevel()
        previousBlock.getAttributeAtLevel(level) is block.getAttributeAtLevel(level)

  canDecreaseBlockAttributeLevel: ->
    @getBlock()?.getAttributeLevel() > 0

  updateCurrentAttributes: ->
    @currentAttributes =
      if selectedRange = @getSelectedRange(ignoreLock: true)
        @document.getCommonAttributesAtRange(selectedRange)
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

  @proxyMethod "getSelectionManager().setLocationRangeFromPoint"
  @proxyMethod "getSelectionManager().preserveSelection"
  @proxyMethod "getSelectionManager().locationIsCursorTarget"
  @proxyMethod "getSelectionManager().selectionIsExpanded"
  @proxyMethod "delegate?.getSelectionManager"

  getPosition: ->
    if locationRange = @getLocationRange()
      @document.positionFromLocation(locationRange[0])

  setPosition: (position) ->
    if location = @document.locationFromPosition(position)
      @setLocation(location)

  setLocation: (location) ->
    @setLocationRange(normalizeRange(location))

  getLocationRange: ->
    @getSelectionManager().getLocationRange() ? normalizeRange(index: 0, offset: 0)

  setLocationRange: ->
    @delegate?.compositionDidRequestLocationRange?(arguments...)

  getExpandedRangeInDirection: (direction) ->
    [startPosition, endPosition] = @getSelectedRange()
    if direction is "backward"
      startPosition = @translateUTF16PositionFromOffset(startPosition, -1)
    else
      endPosition = @translateUTF16PositionFromOffset(endPosition, 1)
    normalizeRange([startPosition, endPosition])

  positionIsCursorTarget: (position) ->
    if location = @document.locationFromPosition(position)
      @locationIsCursorTarget(location)

  # Selection

  getSelectedRange: ->
    if locationRange = @getLocationRange()
      @document.rangeFromLocationRange(locationRange)

  setSelectedRange: (selectedRange) ->
    locationRange = @document.locationRangeFromRange(selectedRange)
    @delegate?.compositionDidRequestLocationRange?(locationRange)

  immediatelySetSelectedRange: (selectedRange) ->
    locationRange = @document.locationRangeFromRange(selectedRange)
    @getSelectionManager().setLocationRange(locationRange)

  moveCursorInDirection: (direction) ->
    if @editingAttachment
      range = @document.getRangeOfAttachment(@editingAttachment)
    else
      selectedRange = @getSelectedRange()
      range = @getExpandedRangeInDirection(direction)
      canEditAttachment = not rangesAreEqual(selectedRange, range)

    if direction is "backward"
      @immediatelySetSelectedRange(range[0])
    else
      @immediatelySetSelectedRange(range[1])

    if canEditAttachment
      if attachment = @getAttachmentAtRange(range)
        @editAttachment(attachment)

  expandSelectionInDirection: (direction) ->
    range = @getExpandedRangeInDirection(direction)
    @immediatelySetSelectedRange(range)

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandSelectionAroundCommonAttribute("href")

  expandSelectionAroundCommonAttribute: (attributeName) ->
    position = @getPosition()
    range = @document.getRangeOfCommonAttributeAtPosition(attributeName, position)
    @immediatelySetSelectedRange(range)

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if selectedRange = @getSelectedRange()
      for attachment in @document.getDocumentAtRange(selectedRange).getAttachments()
        return true if attachment.hasAttribute(attributeName)
      false

  selectionIsInCursorTarget: ->
    @editingAttachment or @positionIsCursorTarget(@getPosition())

  getSelectedDocument: ->
    if locationRange = @getLocationRange()
      @document.getDocumentAtLocationRange(locationRange)

  # Attachments

  getAttachments: ->
    @document.getAttachments()

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
    @document

  getPreviousBlock: ->
    if locationRange = @getLocationRange()
      {index} = locationRange[0]
      @document.getBlockAtIndex(index - 1) if index > 0

  getBlock: ->
    if locationRange = @getLocationRange()
      @document.getBlockAtIndex(locationRange[0].index)

  getAttachmentAtRange: (range) ->
    document = @document.getDocumentAtRange(range)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  notifyDelegateOfInsertionAtRange: (range) ->
    @delegate?.compositionDidPerformInsertionAtRange?(range)

  translateUTF16PositionFromOffset: (position, offset) ->
    utf16string = @document.toUTF16String()
    utf16position = utf16string.offsetFromUCS2Offset(position)
    utf16string.offsetToUCS2Offset(utf16position + offset)
