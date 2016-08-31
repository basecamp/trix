#= require trix/views/block_view

{defer, makeElement} = Trix

class Trix.DocumentView extends Trix.ObjectView
  @render: (document) ->
    element = makeElement("div")
    view = new this document, {element}
    view.render()
    view.sync()
    element

  constructor: ->
    super
    {@element} = @options
    @elementStore = new Trix.ElementStore
    @setDocument(@object)

  setDocument: (document) ->
    unless document.isEqualTo(@document)
      @document = @object = document

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
    originalNodes = [@element.childNodes...]

    countNodes = (element) ->
      count = 0
      iterator = document.createNodeIterator(element)
      count++ while iterator.nextNode()
      count

    console.group("sync")
    console.log "document.getLength():", @element.editor?.getDocument().getLength()
    console.log "@element node count:", countNodes(@element)
    console.log "@shadowElement node count:", countNodes(@shadowElement)

    console.group("with fragment")
    console.time("total")
    fragment = @createDocumentFragmentForSync()
    @element.removeChild(@element.lastChild) while @element.lastChild
    @element.appendChild(fragment)
    console.timeEnd("total")
    console.groupEnd("with fragment")

    @element.removeChild(@element.lastChild) while @element.lastChild
    @element.appendChild(originalNode) for originalNode in originalNodes

    console.group("with patch")
    console.time("total")
    stats = patch(@element, @shadowElement)
    console.timeEnd("total")
    console.log "stats: #{JSON.stringify(stats)}"
    console.groupEnd("with patch")
    console.groupEnd("sync")

    @didSync()

  patch = (node, otherNode, stats = added: 0, removed: 0, replaced: 0, preserved: 0) ->
    if node.isEqualNode(otherNode)
      stats.preserved++
    else
      children = [node.childNodes...]
      otherChildren = [otherNode.childNodes...]

      index = 0
      lastIndex = otherChildren.length - 1

      while index <= lastIndex
        child = children[index]
        otherChild = otherChildren[index]

        if child
          if child.isEqualNode(otherChild)
            stats.preserved++
          else
            if child.nodeType isnt otherChild.nodeType or child.tagName isnt otherChild.tagName
              stats.replaced++
              child.parentNode.replaceChild(otherChild.cloneNode(true), child)
            else if child.childNodes.length and otherChild.childNodes.length
              patch(child, otherChild, stats)
            else
              stats.replaced++
              child.parentNode.replaceChild(otherChild.cloneNode(true), child)
        else
          stats.added++
          node.appendChild(otherChild.cloneNode(true))

        index++

      while children[index]
        stats.removed++
        node.removeChild(children[index])
        index++

      stats

  # Private

  didSync: ->
    @elementStore.reset(findStoredElements(@element))
    defer => @garbageCollectCachedViews()

  createDocumentFragmentForSync: ->
    fragment = document.createDocumentFragment()

    for node in @shadowElement.childNodes
      fragment.appendChild(node.cloneNode(true))

    for element in findStoredElements(fragment)
      if storedElement = @elementStore.remove(element)
        element.parentNode.replaceChild(storedElement, element)

    fragment

  findStoredElements = (element) ->
    element.querySelectorAll("[data-trix-store-key]")

  elementsHaveEqualHTML = (element, otherElement) ->
    ignoreSpaces(element.innerHTML) is ignoreSpaces(otherElement.innerHTML)

  ignoreSpaces = (html) ->
    html.replace(/&nbsp;/g, " ")
