class Trix.View
  resetCache: ->
    @cache = locations: {}, objects: {}

  cacheNode: (node, args...) ->
    for arg in args
      if arg.offset?
        @cacheNodeWithLocation(node, arg)
      else
        @cacheNodeWithObject(node, arg)
    node

  cacheNodeWithLocation: (node, {index, offset}) ->
    if index?
      @cache.locations.currentIndex = index
    else
      index = @cache.locations.currentIndex

    @cache.locations[index] ?= {}
    @cache.locations[index][offset] ?= []
    @cache.locations[index][offset].push(node)
    node

  cacheNodeWithObject: (node, object) ->
    nodes = if node.nodeType is Node.DOCUMENT_FRAGMENT_NODE
      [node.childNodes...]
    else
      [node]
    @cache.objects[object.id] = {object, nodes}
    node

  findObjectForNode: (node) ->
    return value.object for key, value of @cache.objects when node in value.nodes

  findNodesForObject: (object) ->
    @cache.objects[object.id]?.nodes

  createChildView: (viewClass, args...) ->
    view = new viewClass args...
    view.parentView = this
    view.cache = @cache
    @childViews ?= []
    @childViews.push(view)
    view

