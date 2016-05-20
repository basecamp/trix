#= require trix/models/document

{normalizeRange, rangesAreEqual, objectsAreEqual, summarizeArrayChange, extend} = Trix

class Trix.Composition extends Trix.BasicObject
  constructor: ->
    @document = new Trix.Document
    @attachments = []
    @currentAttributes = {}
    @revision = 0

  setDocument: (document) ->
    unless document.isEqualTo(@document)
      @document = document
      @refreshAttachments()
      @revision++
      @delegate?.compositionDidChangeDocument?(document)

  # Snapshots

  getSnapshot: ->
    document: @document
    selectedRange: @getSelectedRange()

  loadSnapshot: ({document, selectedRange}) ->
    @delegate?.compositionWillLoadSnapshot?()
    @setDocument(document ? new Trix.Document)
    @setSelection(selectedRange ? [0, 0])
    @delegate?.compositionDidLoadSnapshot?()

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    selectedRange = @getSelectedRange()
    @setDocument(@document.insertTextAtRange(text, selectedRange))

    startPosition = selectedRange[0]
    endPosition = startPosition + text.getLength()

    @setSelection(endPosition) if updatePosition
    @notifyDelegateOfInsertionAtRange([startPosition, endPosition])

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = new Trix.Document) ->
    selectedRange = @getSelectedRange()
    @setDocument(@document.insertDocumentAtRange(document, selectedRange))

    startPosition = selectedRange[0]
    endPosition = startPosition + document.getLength()

    @setSelection(endPosition)
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

    @setSelection(endPosition)
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
      else if offset - 1 isnt 0
        position += 1

    newDocument = new Trix.Document [block.removeLastAttribute().copyWithoutText()]
    @setDocument(document.insertDocumentAtRange(newDocument, range))
    @setSelection(position)

  insertLineBreak: ->
    [startPosition, endPosition] = @getSelectedRange()
    startLocation = @document.locationFromPosition(startPosition)
    endLocation = @document.locationFromPosition(endPosition)
    block = @document.getBlockAtIndex(endLocation.index)

    if block.hasAttributes()
      if block.isListItem()
        if block.isEmpty()
          @decreaseListLevel()
          @setSelection(startPosition)
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

  insertHTML: (html) ->
    startPosition = @getPosition()
    startLength = @document.getLength()

    document = Trix.Document.fromHTML(html)
    @setDocument(@document.mergeDocumentAtRange(document, @getSelectedRange()))

    endLength = @document.getLength()
    endPosition = startPosition + (endLength - startLength)

    @setSelection(endPosition)
    @notifyDelegateOfInsertionAtRange([endPosition, endPosition])

  replaceHTML: (html) ->
    document = Trix.Document.fromHTML(html).copyUsingObjectsFromDocument(@document)
    locationRange = @getLocationRange(strict: false)
    selectedRange = @document.rangeFromLocationRange(locationRange)
    @setDocument(document)
    @setSelection(selectedRange)

  insertFile: (file) ->
    if @delegate?.compositionShouldAcceptFile(file)
      attachment = Trix.Attachment.attachmentForFile(file)
      @insertAttachment(attachment)

  insertAttachment: (attachment) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
    @insertText(text)

  deleteInDirection: (direction) ->
    range = [startPosition, endPosition] = @getSelectedRange()
    block = @getBlock()

    if startPosition is endPosition
      startLocation = @document.locationFromPosition(startPosition)
      if direction is "backward" and startLocation.offset is 0
        if @canDecreaseBlockAttributeLevel()
          if block.isListItem()
            @decreaseListLevel()
          else
            @decreaseBlockAttributeLevel()

          @setSelection(startPosition)
          return if block.isEmpty()

      range = @getExpandedRangeInDirection(direction)

      if direction is "backward"
        attachment = @getAttachmentAtRange(range)

    if attachment
      @editAttachment(attachment)
      false
    else
      @setDocument(@document.removeTextAtRange(range))
      @setSelection(range[0])
      false if block.isListItem()

  moveTextFromRange: (range) ->
    [position] = @getSelectedRange()
    @setDocument(@document.moveTextFromRangeToPosition(range, position))
    @setSelection(position)

  removeAttachment: (attachment) ->
    if range = @document.getRangeOfAttachment(attachment)
      @stopEditingAttachment()
      @setDocument(@document.removeTextAtRange(range))
      @setSelection(range[0])

  removeLastBlockAttribute: ->
    [startPosition, endPosition] = @getSelectedRange()
    block = @document.getBlockAtPosition(endPosition)
    @removeCurrentAttribute(block.getLastAttribute())
    @setSelection(startPosition)

  placeholder = " "

  insertPlaceholder: ->
    @placeholderPosition = @getPosition()
    @insertString(placeholder)

  selectPlaceholder: ->
    if @placeholderPosition?
      @setSelectedRange([@placeholderPosition, @placeholderPosition + placeholder.length])
      @getSelectedRange()

  forgetPlaceholder: ->
    @placeholderPosition = null

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
    @setSelection(selectedRange)

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
    if selectedRange = @getSelectedRange(ignoreLock: true)
      commonAttributes = @document.getCommonAttributesAtRange(selectedRange)
      unless objectsAreEqual(commonAttributes, @currentAttributes)
        @currentAttributes = commonAttributes
        @notifyDelegateOfCurrentAttributesChange()

  getCurrentAttributes: ->
    extend.call({}, @currentAttributes)

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

  # Selection

  @proxyMethod "getSelectionManager().getPointRange"
  @proxyMethod "getSelectionManager().setLocationRangeFromPointRange"
  @proxyMethod "getSelectionManager().locationIsCursorTarget"
  @proxyMethod "getSelectionManager().selectionIsExpanded"
  @proxyMethod "delegate?.getSelectionManager"

  setSelection: (selectedRange) ->
    locationRange = @document.locationRangeFromRange(selectedRange)
    @delegate?.compositionDidRequestChangingSelectionToLocationRange(locationRange)

  getSelectedRange: ->
    if locationRange = @getLocationRange()
      @document.rangeFromLocationRange(locationRange)

  setSelectedRange: (selectedRange) ->
    locationRange = @document.locationRangeFromRange(selectedRange)
    @getSelectionManager().setLocationRange(locationRange)

  getPosition: ->
    if locationRange = @getLocationRange()
      @document.positionFromLocation(locationRange[0])

  getLocationRange: (options) ->
    @getSelectionManager().getLocationRange(options) ? normalizeRange(index: 0, offset: 0)

  getExpandedRangeInDirection: (direction) ->
    [startPosition, endPosition] = @getSelectedRange()
    if direction is "backward"
      startPosition = @translateUTF16PositionFromOffset(startPosition, -1)
    else
      endPosition = @translateUTF16PositionFromOffset(endPosition, 1)
    normalizeRange([startPosition, endPosition])

  moveCursorInDirection: (direction) ->
    if @editingAttachment
      range = @document.getRangeOfAttachment(@editingAttachment)
    else
      selectedRange = @getSelectedRange()
      range = @getExpandedRangeInDirection(direction)
      canEditAttachment = not rangesAreEqual(selectedRange, range)

    if direction is "backward"
      @setSelectedRange(range[0])
    else
      @setSelectedRange(range[1])

    if canEditAttachment
      if attachment = @getAttachmentAtRange(range)
        @editAttachment(attachment)

  expandSelectionInDirection: (direction) ->
    range = @getExpandedRangeInDirection(direction)
    @setSelectedRange(range)

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandSelectionAroundCommonAttribute("href")

  expandSelectionAroundCommonAttribute: (attributeName) ->
    position = @getPosition()
    range = @document.getRangeOfCommonAttributeAtPosition(attributeName, position)
    @setSelectedRange(range)

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if selectedRange = @getSelectedRange()
      for attachment in @document.getDocumentAtRange(selectedRange).getAttachments()
        return true if attachment.hasAttribute(attributeName)
      false

  selectionIsInCursorTarget: ->
    @editingAttachment or @positionIsCursorTarget(@getPosition())

  positionIsCursorTarget: (position) ->
    if location = @document.locationFromPosition(position)
      @locationIsCursorTarget(location)

  positionIsBlockBreak: (position) ->
    @document.getPieceAtPosition(position)?.isBlockBreak()

  getSelectedDocument: ->
    if selectedRange = @getSelectedRange()
      @document.getDocumentAtRange(selectedRange)

  # Attachments

  getAttachments: ->
    @attachments.slice(0)

  refreshAttachments: ->
    attachments = @document.getAttachments()
    {added, removed} = summarizeArrayChange(@attachments, attachments)

    for attachment in removed
      attachment.delegate = null
      @delegate?.compositionDidRemoveAttachment?(attachment)

    for attachment in added
      attachment.delegate = this
      @delegate?.compositionDidAddAttachment?(attachment)

    @attachments = attachments

  # Attachment delegate

  attachmentDidChangeAttributes: (attachment) ->
    @revision++
    @delegate?.compositionDidEditAttachment?(attachment)

  # Attachment editing

  editAttachment: (attachment) ->
    return if attachment is @editingAttachment
    @stopEditingAttachment()
    @editingAttachment = attachment
    @delegate?.compositionDidStartEditingAttachment?(@editingAttachment)

  stopEditingAttachment: ->
    return unless @editingAttachment
    @delegate?.compositionDidStopEditingAttachment?(@editingAttachment)
    @editingAttachment = null

  canEditAttachmentCaption: ->
    @editingAttachment?.isPreviewable()

  updateAttributesForAttachment: (attributes, attachment) ->
    @setDocument(@document.updateAttributesForAttachment(attributes, attachment))

  removeAttributeForAttachment: (attribute, attachment) ->
    @setDocument(@document.removeAttributeForAttachment(attribute, attachment))

  # Private

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
