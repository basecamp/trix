#= require trix/utilities/object
#= require trix/models/block
#= require trix/models/splittable_list

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

  replaceDocument: edit (document) ->
    @blockList = document.blockList.copy()

  getBlockAtIndex: (index) ->
    @blockList.getObjectAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  eachBlock: (callback) ->
    callback(block, index) for block, index in @blockList.toArray()

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

  insertDocumentAtLocationRange: edit (document, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    position = @blockList.findPositionAtIndexAndOffset(locationRange.index, locationRange.offset)
    @blockList = @blockList.insertSplittableListAtPosition(document.blockList, position)

  insertTextAtLocationRange: edit (text, locationRange) ->
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, locationRange.offset))

  removeTextAtLocationRange: edit (locationRange) ->
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
    else
      blockList = new Trix.SplittableList [new Trix.Block]

    @blockList = blockList

  replaceTextAtLocationRange: edit (text, locationRange) ->
    @removeTextAtLocationRange(locationRange)
    @insertTextAtLocationRange(text, locationRange)

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

  resizeAttachmentToDimensions: edit (attachment, dimensions) ->
    locationRange = @getLocationRangeOfAttachment(attachment)
    text = @getTextAtIndex(locationRange.index)
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(text.resizeAttachmentToDimensions(attachment, dimensions))

  rangeFromLocationRange: (locationRange) ->
    leftPosition = @blockList.findPositionAtIndexAndOffset(locationRange.start.index, locationRange.start.offset)
    rightPosition = @blockList.findPositionAtIndexAndOffset(locationRange.end.index, locationRange.end.offset)
    [leftPosition, rightPosition]

  toJSON: ->
    @blockList.toJSON()
