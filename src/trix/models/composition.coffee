#= require trix/models/document

class Trix.Composition extends Trix.BasicObject
  constructor: (document = new Trix.Document) ->
    @loadDocument(document)

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
    if updatePosition
      position = @getPosition()

    locationRange = @getLocationRange()
    @document.insertTextAtLocationRange(text, locationRange)

    if updatePosition
      @setPosition(position + text.getLength())

  insertBlock: (block = new Trix.Block) ->
    document = new Trix.Document [block]
    @insertDocument(document)

  insertDocument: (document = Trix.Document.fromString("")) ->
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, locationRange)
    @setPosition(position + document.getLength())

  insertString: (string, options) ->
    attributes = @getCurrentTextAttributes()
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @insertText(text, options)

  insertBlockBreak: ->
    position = @getPosition()
    locationRange = @getLocationRange()
    @document.insertBlockBreakAtLocationRange(locationRange)
    @setPosition(position + 1)

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
    locationRange = @getLocationRange()

    if locationRange.isCollapsed()
      range = @getRange()
      if direction is "backward"
        range[0]--
      else
        range[1]++

      locationRange = @document.locationRangeFromRange(range)
      attachment = @getAttachmentAtLocationRange(locationRange)

    if attachment
      @setLocationRange(locationRange)
      # @editAttachment(attachment)
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
    attributes[key] = value for key, value of @currentAttributes when Trix.config.textAttributes[key]
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

  # Location range

  @proxyMethod "getSelectionManager().getLocationRange"
  @proxyMethod "getSelectionManager().setLocationRangeFromPoint"
  @proxyMethod "getSelectionManager().preserveSelection"
  @proxyMethod "getSelectionManager().locationIsCursorTarget"
  @proxyMethod "getSelectionManager().selectionIsExpanded"
  @proxyMethod "delegate?.getSelectionManager"

  setLocationRange: ->
    @delegate?.compositionDidRequestLocationRange?(arguments...)

  getRange: ->
    locationRange = @getLocationRange()
    @document.rangeFromLocationRange(locationRange)

  setRange: (range) ->
    locationRange = @document.locationRangeFromRange(range)
    @setLocationRange(locationRange)

  getPosition: ->
    @getRange()[0]

  setPosition: (position) ->
    locationRange = @document.locationRangeFromPosition(position)
    @setLocationRange(locationRange)

  # Selection

  setSelectionForLocationRange: ->
    @getSelectionManager().setLocationRange(arguments...)

  moveCursorInDirection: (direction) ->
    distance = if direction is "backward" then -1 else 1
    locationRange = @document.locationRangeFromPosition(@getPosition() + distance)
    @setSelectionForLocationRange(locationRange)

  expandSelectionInDirection: (direction) ->
    range = @getRange()
    if direction is "backward" then range[0]-- else range[1]++
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

  getDocument: ->
    @document.copy()

  refreshAttachments: ->
    @attachments.refresh(@document.getAttachments())

  getAttachmentAtLocationRange: (locationRange) ->
    document = @document.getDocumentAtLocationRange(locationRange)
    if document.toString() is "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
      document.getAttachments()[0]
