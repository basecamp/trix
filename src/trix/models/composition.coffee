#= require trix/models/document

class Trix.Composition
  forwardMethodsToSelectionManager = "getLocationRange setLocationRange setLocationRangeFromPoint
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
    @notifyDelegateOfIntentionToSetLocationRange() if updatePosition

    range = @getLocationRange()
    @document.insertTextAtLocationRange(text, range)

    if updatePosition
      {index, offset} = range.start
      offset += text.getLength()
      @setLocationRange([index, offset])

  insertDocument: (document = Trix.Document.fromString("")) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    position = @getPosition()
    range = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, range)
    @setPosition(position + document.getLength())

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @getCurrentTextAttributes())
    @insertText(text, options)

  insertBlockBreak: ->
    @notifyDelegateOfIntentionToSetLocationRange()
    position = @getPosition()
    range = @getLocationRange()
    @document.insertBlockBreakAtLocationRange(range)
    @setPosition(position + 1)

  insertLineBreak: ->
    range = @getLocationRange()
    block = @document.getBlockAtIndex(range.end.index)

    if block.hasAttributes()
      attributes = block.getAttributes()
      if attributes.bullet or attributes.number
        if block.isEmpty()
          @removeCurrentAttribute(key) for key of block.getAttributes()
        else
          @insertBlockBreak()
      else
        text = block.text.getTextAtRange([0, range.end.offset])
        switch
          # Remove block attributes
          when block.isEmpty()
            @removeCurrentAttribute(key) for key of block.getAttributes()
          # Break out of block after a newline (and remove the newline)
          when text.endsWithString("\n")
            @expandSelectionInDirection("backward")
            @insertDocument()
          # Stay in the block, add a newline
          else
            @insertString("\n")
    else
      @insertString("\n")

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html, { attachments: @document.attachments })
    block = document.getBlockAtIndex(0)

    if document.blockList.length is 1 and not block.hasAttributes()
      @insertText(block.getTextWithoutBlockBreak())
    else
      @insertDocument(document)

  replaceHTML: (html) ->
    @preserveSelection =>
      document = Trix.Document.fromHTML(html, { attachments: @document.attachments })
      @document.replaceDocument(document)

  insertFile: (file) ->
    if @delegate?.compositionShouldAcceptFile(file)
      attachment = Trix.Attachment.attachmentForFile(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteInDirectionWithGranularity: (direction, granularity) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    range = @getLocationRange()

    if range.isCollapsed()
      if granularity is "character"
        @expandSelectionInDirection(direction)
      else
        @selectionManager.expandSelectionInDirectionWithGranularity(direction, granularity)
      range = @getLocationRange()

    @document.removeTextAtLocationRange(range)
    @setLocationRange(range.collapse())

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
    if Trix.attributes[attributeName]?.block
      @removeCurrentAttribute(key) for key of @currentAttributes when Trix.attributes[key]?.block
      @setBlockAttribute(attributeName, value)
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
    [startPosition, endPosition] = @document.rangeFromLocationRange(locationRange)

    @document.applyBlockAttributeAtLocationRange(attributeName, value, locationRange)

    {start} = @document.locationRangeFromPosition(startPosition)
    {end} = @document.locationRangeFromPosition(endPosition)
    @setLocationRange(start, end)

  removeCurrentAttribute: (attributeName) ->
    if Trix.attributes[attributeName]?.block
      @removeBlockAttribute(attributeName)
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

  updateCurrentAttributes: ->
    @currentAttributes =
      if range = @getLocationRange()
        @document.getCommonAttributesAtLocationRange(range)
      else
        {}

    @notifyDelegateOfCurrentAttributesChange()

  getCurrentTextAttributes: ->
    attributes = {}
    attributes[key] = value for key, value of @currentAttributes when not Trix.attributes[key]?.block
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

  getPosition: ->
    locationRange = @getLocationRange()
    @document.rangeFromLocationRange(locationRange)[0]

  setPosition: (position) ->
    locationRange = @document.locationRangeFromPosition(position)
    @setLocationRange(locationRange)

  adjustPositionInDirection: (direction) ->
    distance = if direction is "backward" then -1 else 1
    @setPosition(@getPosition() + distance)

  expandLocationRangeInDirection: (direction) ->
    locationRange = @getLocationRange()
    [start, end] = @document.rangeFromLocationRange(locationRange)
    if direction is "backward" then start-- else end++
    @setLocationRange(@document.locationRangeFromRange([start, end]))

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
    range = @getLocationRange()

    if range.isInSingleIndex()
      {index} = range
      text = @document.getTextAtIndex(index)
      textRange = [range.start.offset, range.end.offset]
      [left, right] = text.getExpandedRangeForAttributeAtRange(attributeName, textRange)

      @setLocationRange([index, left], [index, right])

  selectionContainsAttachmentWithAttribute: (attributeName) ->
    if range = @getLocationRange()
      for piece in @document.getDocumentAtLocationRange(range).getAttachmentPieces()
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
    character in ["\n", Trix.AttachmentPiece.OBJECT_REPLACEMENT_CHARACTER]

  getDocument: ->
    @document.copy()

  refreshAttachments: ->
    @attachments.refresh(@document.getAttachments())
