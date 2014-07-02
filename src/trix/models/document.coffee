#= require trix/utilities/object
#= require trix/models/block
#= require trix/models/splittable_list
#= require trix/models/location_range

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
    this

  insertDocumentAtLocationRange: edit (document, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    position = @blockList.findPositionAtIndexAndOffset(locationRange.index, locationRange.offset)
    @blockList = @blockList.insertSplittableListAtPosition(document.blockList, position)

  replaceDocument: edit (document) ->
    @blockList = document.blockList.copy()

  insertTextAtLocationRange: edit (text, locationRange) ->
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      if block.isPlaceholder()
        block.copyWithText(text)
      else
        block.copyWithText(block.text.insertTextAtPosition(text, locationRange.offset))

  removeTextAtLocationRange: edit (locationRange) ->
    return if locationRange.isCollapsed()
    range = @rangeFromLocationRange(locationRange)
    blockList = @blockList.removeObjectsInRange(range)

    if blockList.length
      unless @locationRangeEndsAtEndOfBlock(locationRange)
        leftIndex = locationRange.index
        rightIndex = leftIndex + 1
        leftBlock = blockList.getObjectAtIndex(leftIndex)
        rightBlock = blockList.getObjectAtIndex(rightIndex)

        if leftBlock and rightBlock
          blockList = blockList.
            removeObjectAtIndex(rightIndex).
            replaceObjectAtIndex(leftBlock.consolidateWith(rightBlock), leftIndex)
    else
      blockList = new Trix.SplittableList [new Trix.Block]

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
    @eachBlockAtLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList = @blockList.editObjectAtIndex index, ->
          block.addAttribute(attribute, value)
      else if range[0] isnt range[1]
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

  insertLineBreakAtLocationRange: edit (locationRange) ->
    @removeTextAtLocationRange(locationRange)
    {offset, index} = locationRange
    block = @getBlockAtIndex(index)

    if offset is block.getLength() and block.text.getStringAtRange([offset - 1, offset]) is "\n"
      @blockList = @blockList.insertObjectAtIndex(Trix.Block.createPlaceholder(), index + 1)
    else
      attributes = block.text.getAttributesAtPosition(offset)
      text = Trix.Text.textForStringWithAttributes("\n", attributes)
      @insertTextAtLocationRange(text, locationRange.collapse())

  resizeAttachmentToDimensions: edit (attachment, dimensions) ->
    locationRange = @getLocationRangeOfAttachment(attachment)
    text = @getTextAtIndex(locationRange.index)
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(text.resizeAttachmentToDimensions(attachment, dimensions))

  getDocumentAtLocationRange: (locationRange) ->
    range = @rangeFromLocationRange(locationRange)
    new @constructor @blockList.getSplittableListInRange(range).toArray()

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

  getAttachments: ->
    attachments = []
    @blockList.eachObject ({text}) ->
      attachments = attachments.concat(text.getAttachments())
    attachments

  getLocationRangeOfAttachment: (attachment) ->
    for {text}, index in @blockList.toArray()
      if range = text.getRangeOfAttachment(attachment)
        return new Trix.LocationRange {index, offset: range[0]}, {index, offset: range[1]}

  getAttachmentById: (id) ->
    for {text} in @blockList.toArray()
      if attachment = text.getAttachmentById(id)
        return attachment

  rangeFromLocationRange: (locationRange) ->
    leftPosition = @blockList.findPositionAtIndexAndOffset(locationRange.start.index, locationRange.start.offset)
    rightPosition = @blockList.findPositionAtIndexAndOffset(locationRange.end.index, locationRange.end.offset) unless locationRange.isCollapsed()
    [leftPosition, rightPosition ? leftPosition]

  locationRangeFromPosition: (position) ->
    new Trix.LocationRange @blockList.findIndexAndOffsetAtPosition(position)

  locationRangeEndsAtEndOfBlock: (locationRange) ->
    {offset, index} = locationRange.end
    offset is @getBlockAtIndex(index).getLength()

  toJSON: ->
    @blockList.toJSON()
