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

  insertLineBreak: ->
    [startPosition, endPosition] = @getSelectedRange()
    block = @document.getBlockAtPosition(startPosition)

    if block.hasAttributes()
      attributes = block.getAttributes()
      blockConfig = Trix.config.blockAttributes[block.getLastAttribute()]
      if blockConfig?.parentAttribute
        if block.isEmpty()
          @removeLastBlockAttribute()
        else
          @insertBlockBreak()
      else
        character = @document.getCharacterAtPosition(endPosition - 1)
        switch
          # Remove block attributes
          when block.isEmpty()
            @removeLastBlockAttribute()
          # Break out of block after a newline (and remove the newline)
          when character is "\n"
            @expandSelectionInDirection("backward")
            newBlock = block.removeLastAttribute().copyWithoutText()
            @insertBlock(newBlock)
          # Stay in the block, add a newline
          else
            @insertString("\n")
    else
      @insertString("\n")

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html)
    block = document.getBlockAtIndex(0)

    if document.blockList.length is 1 and not block.hasAttributes()
      @insertText(block.getTextWithoutBlockBreak())
    else
      @insertDocument(document)

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
    [startPosition, endPosition] = positionRange = @getSelectedRange()

    if startPosition is endPosition
      positionRange = @getExpandedRangeInDirection(direction)

      if direction is "backward"
        attachment = @getAttachmentAtPositionRange(positionRange)

    if attachment
      @setSelectedRange(positionRange)
      @editAttachment(attachment)
    else
      @document.removeTextAtPositionRange(positionRange)
      @setSelectedRange(positionRange[0])

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
      @updateCurrentAttributes()
    else
      @setTextAttribute(attributeName, value)
      @currentAttributes[attributeName] = value
      @notifyDelegateOfCurrentAttributesChange()

  setTextAttribute: (attributeName, value) ->
    return unless selectedRange = @getSelectedRange()
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
    [startPosition] = @getSelectedRange()
    block = @document.getBlockAtPosition(startPosition)
    if attribute = block.getLastAttribute()
      @setCurrentAttribute(attribute)

  decreaseBlockAttributeLevel: ->
    [startPosition] = @getSelectedRange()
    block = @document.getBlockAtPosition(startPosition)
    if attribute = block.getLastAttribute()
      @removeCurrentAttribute(attribute)

  canChangeBlockAttributeLevel: ->
    return unless selectedRange = @getSelectedRange()
    block = @document.getBlockAtPosition(selectedRange[0])
    block.getAttributes().length

  updateCurrentAttributes: ->
    @currentAttributes =
      if selectedRange = @getSelectedRange()
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

  @proxyMethod "getSelectionManager().getLocationRange"
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

  getExpandedRangeInDirection: (direction) ->
    positionRange = @getSelectedRange()
    if direction is "backward"
      positionRange[0]--
    else
      positionRange[1]++
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
    @editingAttachment?.isImage()

  # Private

  getDocument: ->
    @document.copy()

  getAttachmentAtPositionRange: (positionRange) ->
    document = @document.getDocumentAtPositionRange(positionRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  notifyDelegateOfInsertionAtPositionRange: (positionRange) ->
    @delegate?.compositionDidPerformInsertionAtPositionRange?(positionRange)
