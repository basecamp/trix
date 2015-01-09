#= require trix/models/document

class Trix.Composition
  forwardMethodsToSelectionManager = "getLocationRange setLocationRangeFromPoint
    preserveSelection locationIsCursorTarget".split(" ")

  constructor: (document = new Trix.Document, @selectionManager) ->
    @loadDocument(document)

    for methodName in forwardMethodsToSelectionManager
      @[methodName] = @selectionManager[methodName].bind(@selectionManager)

  loadDocument: (document) ->
    @document = document
    @document.delegate = this
    @currentAttributes = {}

    for attachment in @document.getAttachments()
      @delegate?.compositionDidAddAttachment?(attachment)

  # Snapshots

  createSnapshot: ->
    document: @getDocument()
    selectedRange: @getLocationRange()

  restoreSnapshot: ({document, selectedRange}) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    @document.replaceDocument(document)
    @setLocationRange(selectedRange)

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
    if updatePosition
      @notifyDelegateOfIntentionToSetLocationRange()
      position = @getPosition()

    locationRange = @getLocationRange()
    @document.insertTextAtLocationRange(text, locationRange)

    if updatePosition
      @setPosition(position + text.getLength())

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = Trix.Document.fromString("")) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, locationRange)
    @setPosition(position + document.getLength())

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @getCurrentTextAttributes())
    @insertText(text, options)

  insertBlockBreak: ->
    @notifyDelegateOfIntentionToSetLocationRange()
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertBlockBreakAtLocationRange(locationRange)
    @setPosition(position + 1)

  insertLineBreak: ->
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.end.index)

    if block.hasAttributes()
      attributes = block.getAttributes()
      blockConfig = Trix.blockAttributes[block.getLastAttribute()]
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
    @preserveSelection =>
      document = Trix.Document.fromHTML(html)
      @document.replaceDocument(document.copyUsingObjectsFromDocument(@document))

  insertFile: (file) ->
    if @delegate?.compositionShouldAcceptFile(file)
      attachment = Trix.Attachment.attachmentForFile(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteInDirectionWithGranularity: (direction, granularity) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    locationRange = @getLocationRange()

    if locationRange.isCollapsed()
      if granularity is "character"
        @expandSelectionInDirection(direction)
      else
        @selectionManager.expandSelectionInDirectionWithGranularity(direction, granularity)
      locationRange = @getLocationRange()

    @document.removeTextAtLocationRange(locationRange)
    @setLocationRange(locationRange.collapse())

  deleteBackward: ->
    @deleteInDirectionWithGranularity("backward", "character")

  deleteForward: ->
    @deleteInDirectionWithGranularity("forward", "character")

  deleteWordBackward: ->
    @deleteInDirectionWithGranularity("backward", "word")

  moveTextFromLocationRange: (locationRange) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    position = @getPosition()
    @document.moveTextFromLocationRangeToPosition(locationRange, position)
    @setPosition(position)

  removeAttachment: (attachment) ->
    if locationRange = @document.getLocationRangeOfAttachment(attachment)
      @notifyDelegateOfIntentionToSetLocationRange()
      @document.removeTextAtLocationRange(locationRange)
      @setLocationRange(locationRange.collapse())

  removeLastBlockAttribute: ->
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.end.index)
    @removeCurrentAttribute(block.getLastAttribute())

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
    if Trix.blockAttributes[attributeName]
      @setBlockAttribute(attributeName, value)
      @updateCurrentAttributes()
    else
      @setTextAttribute(attributeName, value)
      @currentAttributes[attributeName] = value
      @notifyDelegateOfCurrentAttributesChange()

  setTextAttribute: (attributeName, value) ->
    return unless locationRange = @getLocationRange()
    unless locationRange.isCollapsed()
      @document.addAttributeAtLocationRange(attributeName, value, locationRange)

  setBlockAttribute: (attributeName, value) ->
    return unless locationRange = @getLocationRange()
    @notifyDelegateOfIntentionToSetLocationRange()
    range = @document.rangeFromLocationRange(locationRange)
    @document.applyBlockAttributeAtLocationRange(attributeName, value, locationRange)
    @setRange(range)

  removeCurrentAttribute: (attributeName) ->
    if Trix.blockAttributes[attributeName]
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
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.index)
    if attribute = block.getLastAttribute()
      @setCurrentAttribute(attribute)

  decreaseBlockAttributeLevel: ->
    locationRange = @getLocationRange()
    block = @document.getBlockAtIndex(locationRange.index)
    if attribute = block.getLastAttribute()
      @removeCurrentAttribute(attribute)

  canChangeBlockAttributeLevel: ->
    if locationRange = @getLocationRange()
      @document.getBlockAtIndex(locationRange.index).getAttributes().length

  updateCurrentAttributes: ->
    @currentAttributes =
      if locationRange = @getLocationRange()
        @document.getCommonAttributesAtLocationRange(locationRange)
      else
        {}

    @notifyDelegateOfCurrentAttributesChange()

  getCurrentTextAttributes: ->
    attributes = {}
    attributes[key] = value for key, value of @currentAttributes when Trix.textAttributes[key]
    attributes

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.compositionDidChangeCurrentAttributes?(@currentAttributes)

  # Selection freezing

  freezeSelection: ->
    @setCurrentAttribute("frozen", true)

  thawSelection: ->
    @removeCurrentAttribute("frozen")

  hasFrozenSelection: ->
    @hasCurrentAttribute("frozen")

  # Location range and selection

  getRange: ->
    locationRange = @getLocationRange()
    @document.rangeFromLocationRange(locationRange)

  setRange: (range) ->
    locationRange = @document.locationRangeFromRange(range)
    @setLocationRange(locationRange)

  setLocationRange: (locationRange) ->
    locationRange = @document.clampLocationRange(locationRange)
    @selectionManager.setLocationRange(locationRange)

  getPosition: ->
    @getRange()[0]

  setPosition: (position) ->
    locationRange = @document.locationRangeFromPosition(position)
    @setLocationRange(locationRange)

  adjustPositionInDirection: (direction) ->
    distance = if direction is "backward" then -1 else 1
    @setPosition(@getPosition() + distance)

  expandLocationRangeInDirection: (direction) ->
    range = @getRange()
    if direction is "backward" then range[0]-- else range[1]++
    @setRange(range)

  expandSelectionInDirection: (direction) ->
    if @shouldExpandInDirectionUsingLocationRange(direction)
      @expandLocationRangeInDirection(direction)
    else
      @selectionManager.expandSelectionInDirectionWithGranularity(direction, "character")

  notifyDelegateOfIntentionToSetLocationRange: ->
    @delegate?.compositionWillSetLocationRange()

  expandSelectionForEditing: ->
    if @hasCurrentAttribute("href")
      @expandLocationRangeAroundCommonAttribute("href")

  expandLocationRangeAroundCommonAttribute: (attributeName) ->
    locationRange = @getLocationRange()

    if locationRange.isInSingleIndex()
      {index} = locationRange
      text = @document.getTextAtIndex(index)
      textRange = [locationRange.start.offset, locationRange.end.offset]
      [left, right] = text.getExpandedRangeForAttributeAtRange(attributeName, textRange)

      @setLocationRange([index, left], [index, right])

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if locationRange = @getLocationRange()
      for piece in @document.getDocumentAtLocationRange(locationRange).getAttachmentPieces()
        return true if piece.hasAttribute(attributeName)
      false

  selectionIsInCursorTarget: ->
    @locationIsCursorTarget(@getLocationRange().start)

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

  shouldExpandInDirectionUsingLocationRange: (direction) ->
    position = @getPosition()
    distance = if direction is "backward" then -1 else 1
    range = [position, position + distance].sort()
    locationRange = @document.locationRangeFromRange(range)
    character = @document.getStringAtLocationRange(locationRange).substr(0, 1)
    character in ["\n", Trix.OBJECT_REPLACEMENT_CHARACTER]

  getDocument: ->
    @document.copy()

  refreshAttachments: ->
    @attachments.refresh(@document.getAttachments())
