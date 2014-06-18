#= require trix/utilities/object
#= require trix/models/block
#= require trix/models/block_list

class Trix.Document extends Trix.Object
  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  constructor: (blocks = []) ->
    super
    @editDepth = 0
    @blockList = new Trix.BlockList blocks

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
    @blockList.getBlockAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  findIndexForText: (text) ->
    return index for block, index in @blockList.blocks when block.text is text

  eachBlock: (callback) ->
    callback(block, index) for block, index in @blockList.blocks

  eachBlockInLocationRange: ([startLocation, endLocation], callback) ->
    if startLocation.index is endLocation.index
      block = @getBlockAtIndex(startLocation.index)
      callback(block, [startLocation.position, endLocation.position], startLocation.index)
    else
      for index in [startLocation.index..endLocation.index]
        block = @getBlockAtIndex(index)

        range = switch index
          when startLocation.index
            [startLocation.position, block.text.getLength()]
          when endLocation.index
            [0, endLocation.position]
          else
            [0, block.text.getLength()]

        callback(block, range, index)

  insertTextAtLocation: edit (text, location) ->
    @blockList.editBlockAtIndex location.index, (block) ->
      block.copyWithText(block.text.insertTextAtPosition(text, location.position))

  removeTextAtLocationRange: edit (locationRange) ->
    # FIXME

  replaceTextAtLocationRange: edit (text, range) ->
    @removeTextAtLocationRange(range)
    @insertTextAtLocation(text, range[0])

  addAttributeAtLocationRange: edit (attribute, value, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList.editBlockAtIndex index, ->
          block.addAttribute(attribute, value)
      else if range[0] isnt range[1]
        @blockList.editBlockAtIndex index, ->
          block.copyWithText(block.text.addAttributeAtRange(attribute, value, range))
      else
        block

  removeAttributeAtLocationRange: edit (attribute, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range, index) =>
      if Trix.attributes[attribute]?.block
        @blockList.editBlockAtIndex index, ->
          block.removeAttribute(attribute)
      else if range[0] isnt range[1]
        @blockList.editBlockAtIndex index, ->
          block.copyWithText(block.text.removeAttributeAtRange(attribute, range))
      else
        block

  getCommonAttributesAtLocationRange: (locationRange) ->
    textAttributes = []
    blockAttributes = []

    @eachBlockInLocationRange locationRange, (block, range) ->
      textAttributes.push(block.text.getCommonAttributesAtRange(range))
      blockAttributes.push(block.getAttributes())

    Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
      .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
      .toObject()

  getAttachments: ->
    attachments = []
    for {text} in @blockList.blocks
      attachments = attachments.concat(text.getAttachments())
    attachments

  getTextAndRangeOfAttachment: (attachment) ->
    for {text} in @blockList.blocks
      if range = text.getRangeOfAttachment(attachment)
        return {text, range}

  getLocationRangeOfAttachment: (attachment) ->
    {text, range} = @getTextAndRangeOfAttachment(attachment) ? {}
    if text
      index = @findIndexForText(text)
      [{index, position: range[0]}, {index, position: range[1]}]

  getAttachmentById: (id) ->
    for {text} in @blockList.blocks
      if attachment = text.getAttachmentById(id)
        return attachment

  resizeAttachmentToDimensions: (attachment) ->
    {text} = @getTextAndRangeOfAttachment(attachment)
    if index = @findIndexForText(text)
      @blockList.editBlockAtIndex index, (block) ->
        block.copyWithText(text.resizeAttachmentToDimensions(attachment, dimensions))

  copy: ->
    new @constructor @blockList.toArray()

  toJSON: ->
    @blockList.toJSON()
