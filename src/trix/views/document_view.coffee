#= require trix/views/block_view

{defer, makeElement} = Trix

class Trix.DocumentView extends Trix.ObjectView
  @render: (document) ->
    element = makeElement("trix-document")
    element.removeAttribute("contenteditable")
    view = new this document, {element}
    view.render()
    element

  constructor: ->
    super
    @document = @object
    {@element} = @options

  render: ->
    @childViews = []

    @element.removeChild(@element.lastChild) while @element.lastChild

    unless @document.isEmpty()
      objects = Trix.ObjectGroup.groupObjects(@document.getBlocks(), asTree: true)
      for object in objects
        view = @findOrCreateCachedChildView(Trix.BlockView, object)
        @element.appendChild(node) for node in view.getNodes()

    @didRender()

  didRender: ->
    defer => @garbageCollectCachedViews()

  focus: ->
    @element.focus()
    Trix.selectionChangeObserver.update()
