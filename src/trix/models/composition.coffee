#= require trix/models/document
#= require trix/models/attachment_manager
#= require trix/utilities/helpers

{countGraphemeClusters, defer} = Trix.Helpers

class Trix.Composition
  constructor: (@document = new Trix.Document, config) ->
    @document.delegate = this
    @currentAttributes = {}

    @attachments = new Trix.AttachmentManager this
    @attachments.delegate = config?.delegate
    @attachments.reset()

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
    defer => @attachments.reset()

  # Responder protocol

  insertText: (text, {updatePosition} = updatePosition: true) ->
    @delegate?.compositionWillSetLocationRange?() if updatePosition

    range = @getLocationRange()
    @document.insertTextAtLocationRange(text, range)

    if updatePosition
      {index, offset} = range.start
      offset += text.getLength()
      @setLocationRange({index, offset})

  insertPlaceholderBlock: ->
    @delegate?.compositionWillSetLocationRange?()
    range = @getLocationRange()
    document = new Trix.Document [Trix.Block.createPlaceholder()]
    @insertDocument(document)
    @setLocationRange(index: range.end.index + 1, offset: 0)

  insertDocument: (document) ->
    @delegate?.compositionWillSetLocationRange?()
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
    switch
      when block.isPlaceholder()
        @insertPlaceholderBlock()
      when range.end.offset is block.getLength()
        if block.hasAttributes() and block.text.endsWithCharacter("\n")
          # Remove the trailing newline
          @selectionDelegate?.expandSelectionInDirectionWithGranularity("backward", "character")
          @insertPlaceholderBlock()
        else
          @insertString("\n")
      else
        @insertString("\n")

  insertHTML: (html) ->
    document = Trix.Document.fromHTML(html, {@attachments})
    @insertDocument(document)

  replaceHTML: (html) ->
    @preserveSelection =>
      document = Trix.Document.fromHTML(html, {@attachments})
      @document.replaceDocument(document)

  insertFile: (file) ->
    if attachment = @attachments.create(file)
      text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
      @insertText(text)

  deleteInDirectionWithGranularity: (direction, granularity) ->
    @delegate?.compositionWillSetLocationRange?()
    range = @getLocationRange()

    if range.isCollapsed()
      @selectionDelegate?.expandSelectionInDirectionWithGranularity(direction, granularity)
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
    @delegate?.compositionWillSetLocationRange?()
    position = @getPosition()
    @document.moveTextFromLocationRangeToPosition(locationRange, position)
    @setPosition(position)

  # Attachment owner protocol

  getAttachments: ->
    @document.getAttachments()

  updateAttachment: (id, attributes) ->
    if attachment = @attachments.get(id)
      @document.edit -> attachment.setAttributes(attributes)

  removeAttachment: (id) ->
    if attachment = @attachments.get(id)
      locationRange = @document.getLocationRangeOfAttachment(attachment)
      @document.removeTextAtLocationRange(locationRange)

  # Current attributes

  hasCurrentAttribute: (attributeName) ->
    @currentAttributes[attributeName]?

  toggleCurrentAttribute: (attributeName) ->
    value = not @currentAttributes[attributeName]
    @setCurrentAttribute(attributeName, value)

  setCurrentAttribute: (attributeName, value) ->
    range = @getLocationRange()
    isBlockAttribute = Trix.attributes[attributeName]?.block

    if isBlockAttribute
      endPosition = @document.rangeFromLocationRange(range)[1]
      range = @document.expandedLocationRangeForBlockTransformation(range)
      @setLocationRange(range)

    if value
      @document.addAttributeAtLocationRange(attributeName, value, range)
      @currentAttributes[attributeName] = value
    else
      @document.removeAttributeAtLocationRange(attributeName, range)
      delete @currentAttributes[attributeName]

    if isBlockAttribute
      @setPosition(endPosition)

    @notifyDelegateOfCurrentAttributesChange()

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
