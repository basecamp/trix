#= require trix/models/document

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
    positionRange = @getPositionRange()
    position = positionRange.start
    @document.insertTextAtPositionRange(text, positionRange)

    endPosition = position + text.getLength()
    @setPosition(endPosition) if updatePosition

    insertedPositionRange = positionRange.copyWithEndPosition(endPosition)
    @notifyDelegateOfInsertionAtPositionRange(insertedPositionRange)

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = Trix.Document.fromString("")) ->
    positionRange = @getPositionRange()
    position = positionRange.start
    @document.insertDocumentAtPositionRange(document, positionRange)

    endPosition = position + document.getLength()
    @setPosition(endPosition)

    insertedPositionRange = positionRange.copyWithEndPosition(endPosition)
    @notifyDelegateOfInsertionAtPositionRange(insertedPositionRange)

  insertString: (string, options) ->
    attributes = @getCurrentTextAttributes()
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @insertText(text, options)

  insertBlockBreak: ->
    positionRange = @getPositionRange()
    position = positionRange.start
    @document.insertBlockBreakAtPositionRange(positionRange)

    endPosition = position + 1
    @setPosition(endPosition)

    insertedPositionRange = positionRange.copyWithEndPosition(endPosition)
    @notifyDelegateOfInsertionAtPositionRange(insertedPositionRange)

  insertLineBreak: ->
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.end.index)

    if block.hasAttributes()
      attributes = block.getAttributes()
      blockConfig = Trix.config.blockAttributes[block.getLastAttribute()]
      if blockConfig?.parentAttribute
        if block.isEmpty()
          @removeLastBlockAttribute()
        else
          @insertBlockBreak()
      else
        text = block.text.getTextAtRange([0, locationRange.end.offset])
        switch
          # Remove block attributes
          when block.isEmpty()
            @removeLastBlockAttribute()
          # Break out of block after a newline (and remove the newline)
          when text.endsWithString("\n")
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
    positionRange = @getPositionRange()

    if positionRange.isCollapsed()
      positionRange = positionRange.expandInDirection(direction)

      if direction is "backward"
        attachment = @getAttachmentAtPositionRange(positionRange)

    if attachment
      @setPositionRange(positionRange)
      @editAttachment(attachment)
    else
      @document.removeTextAtPositionRange(positionRange)
      @setPositionRange(positionRange.collapse())

  moveTextFromPositionRange: (positionRange) ->
    position = @getPosition()
    @document.moveTextFromPositionRangeToPosition(positionRange, position)
    @setPosition(position)

  removeAttachment: (attachment) ->
    if positionRange = @document.getPositionRangeOfAttachment(attachment)
      @stopEditingAttachment()
      @document.removeTextAtPositionRange(positionRange)
      @setPositionRange(positionRange.collapse())

  removeLastBlockAttribute: ->
    positionRange = @getPositionRange()
    block = @document.getBlockAtPosition(positionRange.end)
    @removeCurrentAttribute(block.getLastAttribute())
    @setPositionRange(positionRange.collapse())

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
    return unless positionRange = @getPositionRange()
    unless positionRange.isCollapsed()
      @document.addAttributeAtPositionRange(attributeName, value, positionRange)

  setBlockAttribute: (attributeName, value) ->
    return unless positionRange = @getPositionRange()
    @document.applyBlockAttributeAtPositionRange(attributeName, value, positionRange)
    @setPositionRange(positionRange)

  removeCurrentAttribute: (attributeName) ->
    if Trix.config.blockAttributes[attributeName]
      @removeBlockAttribute(attributeName)
      @updateCurrentAttributes()
    else
      @removeTextAttribute(attributeName)
      delete @currentAttributes[attributeName]
      @notifyDelegateOfCurrentAttributesChange()

  removeTextAttribute: (attributeName) ->
    return unless positionRange = @getPositionRange()
    unless positionRange.isCollapsed()
      @document.removeAttributeAtPositionRange(attributeName, positionRange)

  removeBlockAttribute: (attributeName) ->
    return unless positionRange = @getPositionRange()
    @document.removeAttributeAtPositionRange(attributeName, positionRange)

  increaseBlockAttributeLevel: ->
    positionRange = @getPositionRange()
    block = @document.getBlockAtPosition(positionRange.start)
    if attribute = block.getLastAttribute()
      @setCurrentAttribute(attribute)

  decreaseBlockAttributeLevel: ->
    positionRange = @getPositionRange()
    block = @document.getBlockAtPosition(positionRange.start)
    if attribute = block.getLastAttribute()
      @removeCurrentAttribute(attribute)

  canChangeBlockAttributeLevel: ->
    if positionRange = @getPositionRange()
      @document.getBlockAtPosition(positionRange.start).getAttributes().length

  updateCurrentAttributes: ->
    @currentAttributes =
      if positionRange = @getPositionRange()
        @document.getCommonAttributesAtPositionRange(positionRange)
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
    if locationRange = @getLocationRange()
      @document.rangeFromLocationRange(locationRange)

  setRange: (range) ->
    if locationRange = @document.locationRangeFromRange(range)
      @setLocationRange(locationRange)

  getPositionRange: ->
    if locationRange = @getLocationRange()
      @document.positionRangeFromLocationRange(locationRange)

  setPositionRange: (positionRange) ->
    if locationRange = @document.locationRangeFromPositionRange(positionRange)
      @setLocationRange(locationRange)

  getPosition: ->
    @getRange()?[0]

  setPosition: (position) ->
    if location = @document.locationFromPosition(position)
      @setLocation(location)

  setLocation: (location) ->
    locationRange = new Trix.LocationRange location
    @setLocationRange(locationRange)

  setLocationRange: ->
    @delegate?.compositionDidRequestLocationRange?(arguments...)

  getExpandedRangeInDirection: (direction) ->
    range = @getRange()
    if direction is "backward"
      range[0]--
    else
      range[1]++
    range

  positionIsCursorTarget: (position) ->
    if location = @document.locationFromPosition(position)
      @locationIsCursorTarget(location)

  # Selection

  setSelectionForLocationRange: ->
    @getSelectionManager().setLocationRange(arguments...)

  setSelectionForPositionRange: (positionRange) ->
    locationRange = @document.locationRangeFromPositionRange(positionRange)
    @getSelectionManager().setLocationRange(locationRange)

  moveCursorInDirection: (direction) ->
    if @editingAttachment
      positionRange = @document.getPositionRangeOfAttachment(@editingAttachment)
    else
      originalPositionRange = @getPositionRange()
      positionRange = originalPositionRange.expandInDirection(direction)
      canEditAttachment = not positionRange.isEqualTo(originalPositionRange)

    if direction is "backward"
      @setSelectionForPositionRange(positionRange.start)
    else
      @setSelectionForPositionRange(positionRange.end)

    if canEditAttachment
      if attachment = @getAttachmentAtPositionRange(positionRange)
        @editAttachment(attachment)

  expandSelectionInDirection: (direction) ->
    positionRange = @getPositionRange().expandInDirection(direction)
    @setSelectionForPositionRange(positionRange)

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandSelectionAroundCommonAttribute("href")

  expandSelectionAroundCommonAttribute: (attributeName) ->
    position = @getPosition()
    positionRange = @document.getPositionRangeOfCommonAttributeAtPosition(attributeName, position)
    @setSelectionForPositionRange(positionRange)

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if positionRange = @getPositionRange()
      for attachment in @document.getDocumentAtPositionRange(positionRange).getAttachments()
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

  # Private

  getDocument: ->
    @document.copy()

  getAttachmentAtLocationRange: (locationRange) ->
    document = @document.getDocumentAtLocationRange(locationRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  getAttachmentAtPositionRange: (positionRange) ->
    document = @document.getDocumentAtPositionRange(positionRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  notifyDelegateOfInsertionAtPositionRange: (positionRange) ->
    @delegate?.compositionDidPerformInsertionAtPositionRange?(positionRange)
