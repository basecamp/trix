#= require trix/utilities/object
#= require trix/models/block
#= require trix/models/splittable_list

class Trix.Document extends Trix.Object
  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  @fromHTML: (html) ->
    Trix.HTMLParser.parse(html).getDocument()

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

  findIndexForText: (text) ->
    return index for block, index in @blockList.toArray() when block.text is text

  eachBlock: (callback) ->
    callback(block, index) for block, index in @blockList.toArray()

  eachBlockAtLocationRange: (range, callback) ->
    if range.isInSingleIndex()
      block = @getBlockAtIndex(range.index)
      textRange = [range.start.position, range.end.position]
      callback(block, textRange, range.index)
    else
      range.eachIndex (index) =>
        block = @getBlockAtIndex(index)

        textRange = switch index
          when range.start.index
            [range.start.position, block.text.getLength()]
          when range.end.index
            [0, range.end.position]
          else
            [0, block.text.getLength()]

        callback(block, textRange, index)

  insertTextAtLocationRange: edit (text, locationRange) ->
    @blockList = @blockList.editObjectAtIndex locationRange.index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, locationRange.position))

  removeTextAtLocationRange: edit (locationRange) ->
    range = @rangeFromLocationRange(locationRange)
    blockList = @blockList.removeObjectsInRange(range)

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

  addAttributeAtLocationRange: edit (attribute, value, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList = @blockList.editObjectAtIndex index, ->
          block.addAttribute(attribute, value)
      else if range[0] isnt range[1]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.addAttributeAtRange(attribute, value, range))

  removeAttributeAtLocationRange: edit (attribute, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList = @blockList.editObjectAtIndex index, ->
          block.removeAttribute(attribute)
      else if range[0] isnt range[1]
        @blockList = @blockList.editObjectAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, range))

  replaceDocument: (document) ->
    @blockList.replaceBlockList(document.blockList)
    @delegate?.didEditDocument?(this)

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

  getCommonAttributesAtLocation: ({index, position}) ->
    block = @getBlockAtIndex(index)
    commonAttributes = block.getAttributes()

    attributes = block.text.getAttributesAtPosition(position)
    attributesLeft = block.text.getAttributesAtPosition(position - 1)
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

  getTextAndRangeOfAttachment: (attachment) ->
    @blockList.eachObject ({text}) ->
      if range = text.getRangeOfAttachment(attachment)
        return {text, range}

  getLocationRangeOfAttachment: (attachment) ->
    {text, range} = @getTextAndRangeOfAttachment(attachment) ? {}
    if text
      index = @findIndexForText(text)
      [{index, position: range[0]}, {index, position: range[1]}]

  getAttachmentById: (id) ->
    @blockList.eachObject ({text}) ->
      if attachment = text.getAttachmentById(id)
        return attachment

  resizeAttachmentToDimensions: (attachment) ->
    {text} = @getTextAndRangeOfAttachment(attachment)
    if index = @findIndexForText(text)
      @blockList = @blockList.editObjectAtIndex index, (block) ->
        block.copyWithText(text.resizeAttachmentToDimensions(attachment, dimensions))

  rangeFromLocationRange: (locationRange) ->
    leftPosition = @blockList.findPositionAtIndexAndOffset(locationRange.start.index, locationRange.start.position)
    rightPosition = @blockList.findPositionAtIndexAndOffset(locationRange.end.index, locationRange.end.position)
    [leftPosition, rightPosition]

  toJSON: ->
    @blockList.toJSON()
