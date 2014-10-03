#= require trix/views/object_view
#= require trix/views/block_view

class Trix.DocumentView extends Trix.ObjectView
  constructor: ->
    super
    @document = @object
    {@element} = @options
    @recordNodeWithLocation(@element, index: 0, offset: 0)

  render: ->
    @element.removeChild(@element.lastChild) while @element.lastChild

    @childViews = []
    unless @document.isEmpty()
      @document.eachBlock (block, blockIndex) =>
        blockView = @findOrCreateChildView(Trix.BlockView, block, {blockIndex})
        @element.appendChild(blockView.render())

    @refreshCache()
    @element

  focus: ->
    @element.focus()
