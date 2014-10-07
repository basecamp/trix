#= require trix/views/object_view
#= require trix/views/block_view
#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.DocumentView extends Trix.ObjectView
  GC_FREQUENCY = 50

  constructor: ->
    super
    @document = @object
    {@element} = @options
    @renderCount = 0

  render: ->
    @childViews = []

    @element.removeChild(@element.lastChild) while @element.lastChild
    unless @document.isEmpty()
      @document.eachBlock (block, blockIndex) =>
        blockView = @findOrCreateCachedChildView(Trix.BlockView, block, {blockIndex})
        @element.appendChild(blockView.render())

    @renderCount++
    @didRender()
    @element

  renderObject: (object) ->
    @findViewForObject(object)?.reRender()

  didRender: ->
    if @renderCount % GC_FREQUENCY is 0
      defer => @garbageCollectCachedViews()

  focus: ->
    @element.focus()

  getBlockElements: ->
    view.element for view in @childViews
