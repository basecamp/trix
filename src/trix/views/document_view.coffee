#= require trix/views/block_view

{defer} = Trix.Helpers
{walkTree, makeElement} = Trix.DOM

class Trix.DocumentView extends Trix.ObjectView
  constructor: ->
    super
    @document = @object
    {@element} = @options

  render: ->
    @childViews = []

    @shadowElement = makeElement("div")

    unless @document.isEmpty()
      objects = Trix.ObjectGroup.groupObjects(@document.getBlocks(), asTree: true)
      for object in objects
        view = @findOrCreateCachedChildView(Trix.BlockView, object)
        @shadowElement.appendChild(node) for node in view.getNodes()

  isSynced: ->
    @shadowElement.innerHTML is @element.innerHTML

  sync: ->
    @element.innerHTML = @shadowElement.innerHTML
    @didRender()

  didRender: ->
    defer => @garbageCollectCachedViews()

  focus: ->
    @element.focus()
