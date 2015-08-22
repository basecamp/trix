#= require trix/models/document

class Trix.Composition extends Trix.BasicObject
  constructor: (@document = new Trix.Document) ->
    @document.delegate = this
    @currentAttributes = {}

  # Snapshots

  createSnapshot: ->
    document: @getDocument()
    selectedRange: @getSelectedRange()

  restoreSnapshot: ({document, selectedRange}) ->
    @document.replaceDocument(document)
    @setSelectedRange(selectedRange)
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
    selectedRange = @getSelectedRange()
    @document.insertTextAtPositionRange(text, selectedRange)

    startPosition = selectedRange[0]
    endPosition = startPosition + text.getLength()

    @setSelectedRange(endPosition) if updatePosition
    @notifyDelegateOfInsertionAtPositionRange([startPosition, endPosition])

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = new Trix.Document) ->
    selectedRange = @getSelectedRange()
    @document.insertDocumentAtPositionRange(document, selectedRange)

    startPosition = selectedRange[0]
    endPosition = startPosition + document.getLength()

    @setSelectedRange(endPosition)
    @notifyDelegateOfInsertionAtPositionRange([startPosition, endPosition])

  insertString: (string, options) ->
    attributes = @getCurrentTextAttributes()
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @insertText(text, options)

  insertBlockBreak: ->
    selectedRange = @getSelectedRange()
    @document.insertBlockBreakAtPositionRange(selectedRange)

    startPosition = selectedRange[0]
    endPosition = startPosition + 1

    @setSelectedRange(endPosition)
    @notifyDelegateOfInsertionAtPositionRange([startPosition, endPosition])

  breakFormattedBlock: ->
    position = @getPosition()
    positionRange = [position - 1, position]

    {index, offset} = @document.locationFromPosition(position)
    block = @document.getBlockAtIndex(index)

    if block.getBlockBreakPosition() is offset
      @document.removeTextAtPositionRange(positionRange)
      positionRange = [position, position]
    else
      if block.text.getStringAtRange([offset, offset + 1]) is "\n"
        positionRange = [position - 1, position + 1]
      else
        position += 1

    document = new Trix.Document [block.removeLastAttribute().copyWithoutText()]
    @document.insertDocumentAtPositionRange(document, positionRange)
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
    @document.mergeDocumentAtPositionRange(document, @getSelectedRange())

    endLength = @document.getLength()
    endPosition = startPosition + (endLength - startLength)

    @setPosition(endPosition)
    @notifyDelegateOfInsertionAtPositionRange([endPosition, endPosition])

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
        attachment = @getAttachmentAtPositionRange(range)

    if attachment
      @editAttachment(attachment)
      false
    else
      @document.removeTextAtPositionRange(range)
      @setPosition(range[0])

  moveTextFromPositionRange: (positionRange) ->
    [position] = @getSelectedRange()
    @document.moveTextFromPositionRangeToPosition(positionRange, position)
    @setSelectedRange(position)

  removeAttachment: (attachment) ->
    if positionRange = @document.getPositionRangeOfAttachment(attachment)
      @stopEditingAttachment()
      @document.removeTextAtPositionRange(positionRange)
      @setSelectedRange(positionRange[0])

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
      @document.addAttributeAtPositionRange(attributeName, value, selectedRange)

  setBlockAttribute: (attributeName, value) ->
    return unless selectedRange = @getSelectedRange()
    @document.applyBlockAttributeAtPositionRange(attributeName, value, selectedRange)
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
    @document.removeAttributeAtPositionRange(attributeName, selectedRange)

  removeBlockAttribute: (attributeName) ->
    return unless selectedRange = @getSelectedRange()
    @document.removeAttributeAtPositionRange(attributeName, selectedRange)

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
    @document.removeLastListAttributeAtPositionRange([startPosition, endPosition])

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
        @document.getCommonAttributesAtPositionRange(selectedRange)
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

  getPositionRange: ->
    if locationRange = @getLocationRange()
      @document.positionRangeFromLocationRange(locationRange)

  getPosition: ->
    if locationRange = @getLocationRange()
      @document.positionFromLocation(locationRange.start)

  setPosition: (position) ->
    if location = @document.locationFromPosition(position)
      @setLocation(location)

  setLocation: (location) ->
    locationRange = new Trix.LocationRange location
    @setLocationRange(locationRange)

  getLocationRange: ->
    @getSelectionManager().getLocationRange() ? new Trix.LocationRange [0, 0]

  setLocationRange: ->
    @delegate?.compositionDidRequestLocationRange?(arguments...)

  getExpandedRangeInDirection: (direction) ->
    positionRange = @getSelectedRange()
    if direction is "backward"
      positionRange[0] = @translateUTF16PositionFromOffset(positionRange[0], -1)
    else
      positionRange[1] = @translateUTF16PositionFromOffset(positionRange[1], 1)
    positionRange

  positionIsCursorTarget: (position) ->
    if location = @document.locationFromPosition(position)
      @locationIsCursorTarget(location)

  # Selection

  getSelectedRange: ->
    if locationRange = @getLocationRange()
      startPosition = @document.positionFromLocation(locationRange.start)
      endPosition = @document.positionFromLocation(locationRange.end)
      [startPosition, endPosition]

  setSelectedRange: (selectedRange) ->
    locationRange = @document.locationRangeFromPositionRange(selectedRange)
    @delegate?.compositionDidRequestLocationRange?(locationRange)

  immediatelySetSelectedRange: (selectedRange) ->
    locationRange = @document.locationRangeFromPositionRange(selectedRange)
    @getSelectionManager().setLocationRange(locationRange)

  moveCursorInDirection: (direction) ->
    if @editingAttachment
      positionRange = @document.getPositionRangeOfAttachment(@editingAttachment)
    else
      selectedRange = @getSelectedRange()
      positionRange = @getExpandedRangeInDirection(direction)
      canEditAttachment = selectedRange.toString() isnt positionRange.toString()

    if direction is "backward"
      @immediatelySetSelectedRange(positionRange[0])
    else
      @immediatelySetSelectedRange(positionRange[1])

    if canEditAttachment
      if attachment = @getAttachmentAtPositionRange(positionRange)
        @editAttachment(attachment)

  expandSelectionInDirection: (direction) ->
    positionRange = @getExpandedRangeInDirection(direction)
    @immediatelySetSelectedRange(positionRange)

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandSelectionAroundCommonAttribute("href")

  expandSelectionAroundCommonAttribute: (attributeName) ->
    position = @getPosition()
    positionRange = @document.getPositionRangeOfCommonAttributeAtPosition(attributeName, position)
    @immediatelySetSelectedRange(positionRange)

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if selectedRange = @getSelectedRange()
      for attachment in @document.getDocumentAtPositionRange(selectedRange).getAttachments()
        return true if attachment.hasAttribute(attributeName)
      false

  selectionIsInCursorTarget: ->
    @editingAttachment or @positionIsCursorTarget(@getPosition())

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

  getAttachmentAtPositionRange: (positionRange) ->
    document = @document.getDocumentAtPositionRange(positionRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  notifyDelegateOfInsertionAtPositionRange: (positionRange) ->
    @delegate?.compositionDidPerformInsertionAtPositionRange?(positionRange)

  translateUTF16PositionFromOffset: (position, offset) ->
    utf16string = @document.toUTF16String()
    utf16position = utf16string.offsetFromUCS2Offset(position)
    utf16string.offsetToUCS2Offset(utf16position + offset)
