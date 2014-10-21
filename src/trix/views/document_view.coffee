#= require trix/views/object_view
#= require trix/views/block_view
#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.DocumentView extends Trix.ObjectView
  constructor: ->
    super
    @document = @object
    {@element} = @options

  render: ->
    @childViews = []

    @element.removeChild(@element.lastChild) while @element.lastChild
    unless @document.isEmpty()
      @document.eachBlock (block, blockIndex) =>
        blockView = @findOrCreateCachedChildView(Trix.BlockView, block, {blockIndex})
        @element.appendChild(blockView.render())

    @didRender()
    @element

  didRender: ->
    defer => @garbageCollectCachedViews()

  focus: ->
    @element.focus()

  getBlockElements: ->
    view.element for view in @childViews
