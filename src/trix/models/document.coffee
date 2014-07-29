#= require trix/utilities/object
#= require trix/models/block
#= require trix/models/splittable_list
#= require trix/models/location_range
#= require trix/models/attachment_manager

class Trix.Document extends Trix.Object
  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  @fromHTML: (html, options) ->
    Trix.HTMLParser.parse(html, options).getDocument()

  constructor: (blocks = []) ->
    super
    @editDepth = 0
    @blockList = new Trix.SplittableList blocks

  initializeAttachmentManagerWithDelegate: (delegate) ->
    @attachments = new Trix.AttachmentManager this
    @attachments.delegate = delegate
    @attachments.reset()

  copy: ->
    new @constructor @blockList.toArray()

  edit = (fn) -> ->
    @beginEditing()
    fn.apply(this, arguments)
    @endEditing()

  edit: edit (fn) -> fn()

  beginEditing: ->
    @editDepth++
    this

  endEditing: ->
    if --@editDepth is 0
      @delegate?.didEditDocument?(this)
      @attachments?.reset()
    this

  insertDocumentAtLocationRange: edit (document, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    position = @blockList.findPositionAtIndexAndOffset(locationRange.index, locationRange.offset)
    @blockList = @blockList.insertSplittableListAtPosition(document.blockList, position)

  replaceDocument: edit (document) ->
    @blockList = document.blockList.copy()

  insertPlaceholderBlockAtLocationRange: edit (locationRange) ->
    document = new Trix.Document [Trix.Block.createPlaceholder()]
    @insertDocumentAtLocationRange(document, locationRange)

  insertTextAtLocationRange: edit (text, locationRange) ->
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      if block.isPlaceholder()
        block.copyWithText(text)
      else
        block.copyWithText(block.text.insertTextAtPosition(text, locationRange.offset))

  removeTextAtLocationRange: edit (locationRange) ->
    return if locationRange.isCollapsed()
    if locationRange.isInSingleIndex()
      @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
        block.copyWithText(block.text.removeTextAtRange([locationRange.start.offset, locationRange.end.offset]))
    else
      range = @rangeFromLocationRange(locationRange)
      blockList = @blockList.removeObjectsInRange(range)

      if blockList.length
        leftIndex = locationRange.index
        rightIndex = leftIndex + 1
        leftBlock = blockList.getObjectAtIndex(leftIndex)
        rightBlock = blockList.getObjectAtIndex(rightIndex)

        if leftBlock and rightBlock
          blockList = blockList.
            removeObjectAtIndex(rightIndex).
            replaceObjectAtIndex(leftBlock.consolidateWith(rightBlock), leftIndex)

      @blockList = blockList

  replaceTextAtLocationRange: edit (text, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    @insertTextAtLocationRange(text, locationRange)

  moveTextFromLocationRangeToPosition: edit (locationRange, position) ->
    range = @rangeFromLocationRange(locationRange)
    return if range[0] <= position <= range[1]
    document = @getDocumentAtLocationRange(locationRange)
    @removeTextAtLocationRange(locationRange)
    position -= document.getLength() if range[0] < position
    @insertDocumentAtLocationRange(document, @locationRangeFromPosition(position))

  addAttributeAtLocationRange: edit (attribute, value, locationRange) ->
    if Trix.attributes[attribute]?.block
      if locationRange.isCollapsed()
        @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
          block.addAttribute(attribute, value)
      else
        range = @rangeFromLocationRange(locationRange)
        @blockList = @blockList.transformObjectsInRange range, (block) ->
          block.addAttribute(attribute, value)
    else
      @eachBlockAtLocationRange locationRange, (block, range, index) =>
        if range[0] isnt range[1]
          @blockList = @blockList.editObjectAtIndex index, ->
            block.copyWithText(block.text.addAttributeAtRange(attribute, value, range))

  removeAttributeAtLocationRange: edit (attribute, locationRange) ->
    @eachBlockAtLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList = @blockList.editObjectAtIndex index, ->
          block.removeAttribute(attribute)
      else if range[0] isnt range[1]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, range))

  updateAttributesForAttachment: edit (attributes, attachment) ->
    locationRange = @getLocationRangeOfAttachment(attachment)
    text = @getTextAtIndex(locationRange.index)
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(text.updateAttributesForAttachment(attributes, attachment))

  getDocumentAtLocationRange: (locationRange) ->
    range = @rangeFromLocationRange(locationRange)
    new @constructor @blockList.getSplittableListInRange(range).toArray()

  getStringAtLocationRange: (locationRange) ->
    @getDocumentAtLocationRange(locationRange).toString()

  getBlockAtIndex: (index) ->
    @blockList.getObjectAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  getLength: ->
    @blockList.getLength()

  eachBlock: (callback) ->
    @blockList.eachObject(callback)

  eachBlockAtLocationRange: (range, callback) ->
    if range.isInSingleIndex()
      block = @getBlockAtIndex(range.index)
      textRange = [range.start.offset, range.end.offset]
      callback(block, textRange, range.index)
    else
      range.eachIndex (index) =>
        block = @getBlockAtIndex(index)

        textRange = switch index
          when range.start.index
            [range.start.offset, block.text.getLength()]
          when range.end.index
            [0, range.end.offset]
          else
            [0, block.text.getLength()]

        callback(block, textRange, index)

  getCommonAttributesAtLocationRange: (locationRange) ->
    if locationRange.isCollapsed()
      @getCommonAttributesAtLocation(locationRange.start)
    else
      textAttributes = []
      blockAttributes = []

      @eachBlockAtLocationRange locationRange, (block, textRange) ->
        textAttributes.push(block.text.getCommonAttributesAtRange(textRange))
        blockAttributes.push(block.getAttributes())

      Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
        .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
        .toObject()

  getCommonAttributesAtLocation: ({index, offset}) ->
    block = @getBlockAtIndex(index)
    return {} unless block

    commonAttributes = block.getAttributes()
    attributes = block.text.getAttributesAtPosition(offset)
    attributesLeft = block.text.getAttributesAtPosition(offset - 1)
    inheritableAttributes = (key for key, value of Trix.attributes when value.inheritable)

    for key, value of attributesLeft
      if value is attributes[key] or key in inheritableAttributes
        commonAttributes[key] = value

    commonAttributes

  getAttachmentPieces: ->
    attachmentPieces = []
    @blockList.eachObject ({text}) ->
      attachmentPieces = attachmentPieces.concat(text.getAttachmentPieces())
    attachmentPieces

  getAttachments: ->
    piece.attachment for piece in @getAttachmentPieces()

  getLocationRangeOfAttachment: (attachment) ->
    for {text}, index in @blockList.toArray()
      if range = text.getRangeOfAttachment(attachment)
        return new Trix.LocationRange {index, offset: range[0]}, {index, offset: range[1]}

  getAttachmentPieceForAttachment: (attachment) ->
    return piece for piece in @getAttachmentPieces() when piece.attachment is attachment

  expandedLocationRangeForBlockTransformation: (locationRange) ->
    {start, end} = locationRange

    unless start.offset is 0
      startString = @getTextAtIndex(start.index).getStringAtRange([0, start.offset])
      startOffset = startString.lastIndexOf("\n")
      start.offset = if startOffset isnt -1 then startOffset + 1 else 0

    endText = @getTextAtIndex(end.index)
    unless end.offset is (endLength = endText.getLength())
      endString = endText.getStringAtRange([end.offset, endLength])
      endOffset = endString.indexOf("\n")
      end.offset = if endOffset isnt -1 then end.offset + endOffset else endLength

    new Trix.LocationRange start, end

  rangeFromLocationRange: (locationRange) ->
    leftPosition = @blockList.findPositionAtIndexAndOffset(locationRange.start.index, locationRange.start.offset)
    rightPosition = @blockList.findPositionAtIndexAndOffset(locationRange.end.index, locationRange.end.offset) unless locationRange.isCollapsed()
    [leftPosition, rightPosition ? leftPosition]

  locationRangeFromPosition: (position) ->
    new Trix.LocationRange @blockList.findIndexAndOffsetAtPosition(position)

  toString: ->
    @blockList.toString()

  toJSON: ->
    @blockList.toJSON()
