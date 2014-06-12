class Trix.BlockList
  constructor: (blocks = []) ->
    @blocks = blocks.slice(0)
    block.delegate = this for block in @blocks

  getBlockAtIndex: (index) ->
    @blocks[index]

  removeText: (textToRemove) ->
    return @removeBlockAtIndex(index) for block, index in @blocks when block.text is textToRemove

  removeBlockAtIndex: (index) ->
    @blocks.splice(index, 1)

  # Block delegate

  didEditBlock: (block) ->
    @delegate?.didEditBlockList?(this)

  toArray: ->
    @blocks.slice(0)

  toJSON: ->
    @toArray()
