#= require trix/views/block_view

{defer, makeElement} = Trix

class Trix.DocumentView extends Trix.ObjectView
  @render: (document) ->
    element = makeElement("trix-document")
    element.removeAttribute("contenteditable")
    view = new this document, {element}
    view.render()
    view.sync()
    element

  constructor: ->
    super
    @document = @object
    {@element} = @options
    @elementStore = new Trix.ElementStore

  render: ->
    @childViews = []

    @shadowElement = makeElement("div")

    unless @document.isEmpty()
      objects = Trix.ObjectGroup.groupObjects(@document.getBlocks(), asTree: true)
      for object in objects
        view = @findOrCreateCachedChildView(Trix.BlockView, object)
        @shadowElement.appendChild(node) for node in view.getNodes()

  isSynced: ->
    elementsHaveEqualHTML(@shadowElement, @element)

  sync: ->
    fragment = @createDocumentFragmentForSync()
    @element.removeChild(@element.lastChild) while @element.lastChild
    @element.appendChild(fragment)
    @didSync()

  focus: ->
    @element.focus()

  # Private

  didSync: ->
    @elementStore.reset(findImages(@element))
    defer => @garbageCollectCachedViews()

  createDocumentFragmentForSync: ->
    fragment = document.createDocumentFragment()

    for node in @shadowElement.childNodes
      fragment.appendChild(node.cloneNode(true))

    for image in findImages(fragment)
      if storedImage = @elementStore.remove(image)
        storedImage.width = image.width
        storedImage.height = image.height
        image.parentNode.replaceChild(storedImage, image)

    fragment

  findImages = (element) ->
    element.querySelectorAll("img")

  elementsHaveEqualHTML = (element, otherElement) ->
    ignoreSpaces(element.innerHTML) is ignoreSpaces(otherElement.innerHTML)

  ignoreSpaces = (html) ->
    html.replace(/&nbsp;/g, " ")
