#= require trix/models/object

class Trix.BlockList extends Trix.Object
  constructor: (blocks) ->
    super
    @replaceBlocks(blocks)

  replaceBlocks: (blocks = []) ->
    @blocks = blocks.slice(0)

  getBlockAtIndex: (index) ->
    @blocks[index]

  removeText: (textToRemove) ->
    return @removeBlockAtIndex(index) for block, index in @blocks when block.text is textToRemove

  insertBlockAtIndex: (block, index) ->
    @blocks.splice(index, 0, block)

  editBlockAtIndex: (index, callback) ->
    @replaceBlockAtIndex(callback(@blocks[index]), index)

  replaceBlockAtIndex: (block, index) ->
    @blocks.splice(index, 1, block)

  removeBlockAtIndex: (index) ->
    @blocks.splice(index, 1)

  copy: ->
    new @constructor @toArray()

  toArray: ->
    @blocks.slice(0)

  toJSON: ->
    @toArray()
