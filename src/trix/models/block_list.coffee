class Trix.BlockList
  constructor: (blocks = []) ->
    @replaceBlocks(blocks)

  getBlockAtIndex: (index) ->
    @blocks[index]

  removeText: (textToRemove) ->
    return @removeBlockAtIndex(index) for block, index in @blocks when block.text is textToRemove

  removeBlockAtIndex: (index) ->
    @blocks.splice(index, 1)

  replaceBlockList: (blockList) ->
    @replaceBlocks(blockList.toArray())

  replaceBlocks: (blocks = []) ->
    @blocks = blocks.slice(0)
    block.delegate = this for block in @blocks

  splitBlockAtLocation: (location) ->
    block = @getBlockAtIndex(location.index)
    range = [location.position, block.text.getLength()]

    newText = block.text.getTextAtRange(range)
    newBlock = new Trix.Block newText, block.attributes.toObject()
    block.text.removeTextAtRange(range)

    index = location.index + 1
    @insertBlockAtIndex(newBlock, index)
    index

  insertBlockAtIndex: (block, index) ->
    @blocks.splice(index, 0, block)

  insertBlockListAtIndex: (blockList, index) ->
    for block, offset in blockList.blocks
      @insertBlockAtIndex(block, index + offset)

  insertBlockListAtLocation: (blockList, location) ->
    index = @splitBlockAtLocation(location)
    @insertBlockListAtIndex(blockList, index)

  # Block delegate

  didEditBlock: (block) ->
    @delegate?.didEditBlockList?(this)

  toArray: ->
    @blocks.slice(0)

  toJSON: ->
    @toArray()
