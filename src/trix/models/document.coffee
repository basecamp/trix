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
    if startLocation.index is endLocation.index
      block = @getBlockAtIndex(startLocation.index)
      callback(block, [startLocation.position, endLocation.position])
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

        callback(block, range)

  insertTextAtLocation: (text, location) ->
    @getTextAtIndex(location.index).insertTextAtPosition(text, location.position)

  removeTextAtLocationRange: (locationRange) ->
    textRuns = []
    @eachBlockInLocationRange locationRange, ({text}, range) ->
      textRuns.push({text, range})

    if textRuns.length is 1
      textRuns[0].text.removeTextAtRange(textRuns[0].range)
    else
      [first, ..., last] = textRuns

      last.text.removeTextAtRange([0, locationRange[1].position])
      first.text.removeTextAtRange([locationRange[0].position, first.text.getLength()])
      first.text.appendText(last.text)

      @blockList.removeText(text) for {text} in textRuns[1..]

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
