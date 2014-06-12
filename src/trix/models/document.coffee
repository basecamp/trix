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

  getTextAtIndex: (index) ->
    @blockList.getBlockAtIndex(index)?.text

  eachBlock: (callback) ->
    callback(text, index) for text, index in @blockList.blocks

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

  setAttributesAtLocationRange: (attributes, [startLocation, endLocation]) ->
    @blockList.getBlockAtIndex(startLocation.block).setAttributes(attributes)

  # BlockList delegate

  didEditBlockList: (blockList) ->
    @delegate?.didEditDocument?(this)

  toJSON: ->
    @blockList.toJSON()

  asJSON: ->
    JSON.stringify(this)
