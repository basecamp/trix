#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.ObjectView
  constructor: (@object, @options = {}) ->
    @childViews = []
    @cacheKey = @object.id.toString()
    @cache = views: {}, locations: {}

  render: ->
    @nodes ?= @createNodes()
    if @nodes.length is 1
      @nodes[0]
    else
      element = document.createDocumentFragment()
      element.appendChild(node) for node in @nodes
      element

  findOrCreateChildView: (viewClass, object, options) ->
    pendingView = new viewClass object, options
    unless view = @cache.views[pendingView.cacheKey]
      view = pendingView
      view.parentView = this
      view.cache = @cache
      @cache.views[view.cacheKey] = view
    @childViews.push(view) unless view in @childViews
    view

  getAllChildViews: ->
    views = []
    for childView in @childViews
      views.push(childView)
      views = views.concat(childView.getAllChildViews())
    views

  recordNodeWithLocation: (node, {index, offset}) ->
    @cache.locations.blockIndex = @blockIndex if @blockIndex?
    index ?= @cache.locations.blockIndex
    @nodeLocations ?= []
    @nodeLocations.push({node, index, offset})
    node

  getNodeLocations: ->
    @cache.locations

  refreshCache: ->
    views = @getAllChildViews().concat(this)
    @refreshLocationCacheWithViews(views)
    defer => @refreshViewCacheWithViews(views)

  refreshLocationCacheWithViews: (views) ->
    @cache.locations = {}
    for view in views when view.nodeLocations?
      for nodeLocation in view.nodeLocations
        @cache.locations[nodeLocation.index] ?= {}
        @cache.locations[nodeLocation.index][nodeLocation.offset] ?= []
        @cache.locations[nodeLocation.index][nodeLocation.offset].push(nodeLocation.node)

  refreshViewCacheWithViews: (views) ->
    cacheKeys = (view.cacheKey for view in views)
    delete @cache.views[key] for key of @cache.views when key not in cacheKeys

  findObjectForNode: (node) ->
    return value.object for key, value of @cache.views when value.nodes and node in value.nodes

  findNodesForObject: (object) ->
    return value.nodes for key, value of @cache.views when value.object is object
