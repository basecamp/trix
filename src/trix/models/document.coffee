#= require trix/models/block
#= require trix/models/block_list

class Trix.Document
  @fromJSONString: (string) ->
    @fromJSON JSON.parse(string)

  @fromJSON: (documentJSON) ->
    blocks = for blockJSON in documentJSON
      Trix.Block.fromJSON blockJSON
    new this blocks

  constructor: (blocks = []) ->
    @blockList = new Trix.BlockList blocks
    @blockList.delegate = this

  getBlockAtIndex: (index) ->
    @blockList.getBlockAtIndex(index)

  getTextAtIndex: (index) ->
    @getBlockAtIndex(index)?.text

  eachBlock: (callback) ->
    callback(text, index) for text, index in @blockList.blocks

  eachBlockInLocationRange: ([startLocation, endLocation], callback) ->
    if startLocation.block is endLocation.block
      block = @getBlockAtIndex(startLocation.block)
      callback(block, [startLocation.position, endLocation.position])
    else
      for index in [startLocation.block..endLocation.block]
        block = @getBlockAtIndex(index)

        range = switch index
          when startLocation.block
            [startLocation.position, block.text.getLength()]
          when endLocation.block
            [0, endLocation.position]
          else
            [0, block.text.getLength()]

        callback(block, range)

  insertTextAtLocation: (text, location) ->
    @getTextAtIndex(location.block).insertTextAtPosition(text, location.position)

  removeTextAtLocationRange: ([startLocation, endLocation]) ->
    if startLocation.block is endLocation.block
      @getTextAtIndex(startLocation.block).removeTextAtRange([startLocation.position, endLocation.position])
    else
      textsToRemove = []

      for block in [endLocation.block..startLocation.block]
        currentText = @getTextAtIndex(block)

        switch block
          when endLocation.block
            currentText.removeTextAtRange([0, endLocation.position])
            endText = currentText
          when startLocation.block
            currentText.removeTextAtRange([startLocation.position, currentText.getLength()])
            currentText.appendText(endText)
            textsToRemove.push(endText)
          else
            textsToRemove.push(currentText)

      if textsToRemove.length
        @blockList.removeText(textToRemove) for textToRemove in textsToRemove
        @delegate?.didEditDocument?(this)

  replaceTextAtLocationRange: (text, range) ->
    @removeTextAtLocationRange(range)
    @insertTextAtLocation(text, range[0])

  addAttributeAtLocationRange: (attribute, value, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range) ->
      if Trix.attributes[attribute]?.block
        block.addAttribute(attribute, value)
      else
        unless range[0] is range[1]
          block.text.addAttributeAtRange(attribute, value, range)

  removeAttributeAtLocationRange: (attribute, locationRange) ->
    @eachBlockInLocationRange locationRange, (block, range) ->
      if Trix.attributes[attribute]?.block
        block.removeAttribute(attribute)
      else
        unless range[0] is range[1]
          block.text.removeAttributeAtRange(attribute, range)

  getCommonAttributesAtLocationRange: (locationRange) ->
    textAttributes = []
    blockAttributes = []

    @eachBlockInLocationRange locationRange, (block, range) ->
      textAttributes.push(block.text.getCommonAttributesAtRange(range))
      blockAttributes.push(block.getAttributes())

    Trix.Hash.fromCommonAttributesOfObjects(textAttributes)
      .merge(Trix.Hash.fromCommonAttributesOfObjects(blockAttributes))
      .toObject()

  # BlockList delegate

  didEditBlockList: (blockList) ->
    @delegate?.didEditDocument?(this)

  toJSON: ->
    @blockList.toJSON()

  asJSON: ->
    JSON.stringify(this)
