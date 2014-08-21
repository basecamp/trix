#= require trix/models/document

class Trix.Composition
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

  # Document delegate

  didEditDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(this, @document)

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    @notifyDelegateOfIntentionToSetLocationRange() if updatePosition

    range = @getLocationRange()
    @document.insertTextAtLocationRange(text, range)

    if updatePosition
      {index, offset} = range.start
      offset += text.getLength()
      @setLocationRange({index, offset})

  insertDocument: (document = Trix.Document.fromString("")) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    range = @getLocationRange()
    @document.insertDocumentAtLocationRange(document, range)

    index = range.index + (blockLength = document.blockList.length)
    offset = document.getBlockAtIndex(blockLength - 1).text.getLength()
    @setLocationRange({index, offset})

  insertString: (string, options) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, options)

  insertLineBreak: ->
    range = @getLocationRange()
    block = @document.getBlockAtIndex(range.end.index)

    if block.hasAttributes()
      text = block.text.getTextAtRange([0, range.end.offset])
      switch
        # Remove block attributes
        when block.isEmpty()
          @removeCurrentAttribute(key) for key of block.getAttributes()
        # Break out of block after a newline (and remove the newline)
        when text.endsWithString("\n")
          @expandSelectionInDirectionWithGranularity("backward", "character")
          @insertDocument()
        # Stay in the block, add a newline
        else
          @insertString("\n")
    else
      @insertString("\n")

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html, { attachments: @document.attachments })
    @insertDocument(document)

  replaceHTML: (html) ->
    @preserveSelection =>
      document = Trix.Document.fromHTML(html, { attachments: @document.attachments })
      @document.replaceDocument(document)

  insertFile: (file) ->
    if @document.attachments.shouldAcceptFile(file)
      attachment = new Trix.Attachment file
      attributes = Trix.Hash.box(@currentAttributes).merge(contentType: file.type, filename: file.name)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, attributes.toObject())
      @insertText(text)

  deleteInDirectionWithGranularity: (direction, granularity) ->
    @notifyDelegateOfIntentionToSetLocationRange()
    range = @getLocationRange()

    if range.isCollapsed()
      @expandSelectionInDirectionWithGranularity(direction, granularity)
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
      @document.removeTextAtLocationRange(locationRange)

  # Current attributes

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

  toggleCurrentAttribute: (attributeName) ->
    if value = not @currentAttributes[attributeName]
      @setCurrentAttribute(attributeName, value)
    else
      @removeCurrentAttribute(attributeName)

  setCurrentAttribute: (attributeName, value) ->
    if Trix.attributes[attributeName]?.block
      @setBlockAttribute(attributeName, value)
    else
      @setTextAttribute(attributeName, value)

    @currentAttributes[attributeName] = value
    @notifyDelegateOfCurrentAttributesChange()

  removeCurrentAttribute: (attributeName) ->
    range = @getLocationRange()
    @document.removeAttributeAtLocationRange(attributeName, range)
    delete @currentAttributes[attributeName]
    @notifyDelegateOfCurrentAttributesChange()

  setTextAttribute: (attributeName, value) ->
    return unless range = @getLocationRange()
    @document.addAttributeAtLocationRange(attributeName, value, range)

  setBlockAttribute: (attributeName, value) ->
    return unless range = @getLocationRange()
    @notifyDelegateOfIntentionToSetLocationRange()
    [startPosition, endPosition] = @document.rangeFromLocationRange(range)

    range = @document.expandLocationRangeToLineBreaksAndSplitBlocks(range)
    @document.addAttributeAtLocationRange(attributeName, value, range)

    {start} = @document.locationRangeFromPosition(startPosition)
    {end} = @document.locationRangeFromPosition(endPosition)
    @setLocationRange(start, end)

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

  notifyDelegateOfIntentionToSetLocationRange: ->
    @delegate?.compositionWillSetLocationRange?()

  expandSelectionInDirectionWithGranularity: (direction, granularity) ->
    @selectionDelegate?.expandSelectionInDirectionWithGranularity(direction, granularity)

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
