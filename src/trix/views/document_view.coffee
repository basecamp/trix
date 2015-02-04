#= require trix/views/block_view

{defer, walkTree, makeElement} = Trix

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

      @addCursorTargetsAroundAttachments()

  isSynced: ->
    @shadowElement.innerHTML is @element.innerHTML

  sync: ->
    @element.innerHTML = @shadowElement.innerHTML
    @didRender()

  didRender: ->
    defer => @garbageCollectCachedViews()

  focus: ->
    @element.focus()
    Trix.selectionChangeObserver.update()

  cursorTarget = """
    <span data-trix-serialize="false" data-trix-cursor-target="true">#{Trix.ZERO_WIDTH_SPACE}</span>
  """

  addCursorTargetsAroundAttachments: ->
    for element in @shadowElement.querySelectorAll("[data-trix-attachment]")
      unless element.previousSibling?.dataset?.trixCursorTarget
        element.insertAdjacentHTML("beforebegin", cursorTarget)
        element.insertAdjacentHTML("afterend", cursorTarget)
