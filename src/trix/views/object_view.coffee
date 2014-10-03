#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.ObjectView
  constructor: (@object, @options = {}) ->
    @childViews = []
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
    unless view = @cache.views[object.toKey()]
      view = new viewClass object, options
      view.parentView = this
      view.cache = @cache
      @cache.views[object.toKey()] = view
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
    objectKeys = (view.object.toKey() for view in views)
    delete @cache.views[key] for key of @cache.views when key not in objectKeys

  findObjectForNode: (node) ->
    return value.object for key, value of @cache.views when value.nodes and node in value.nodes

  findNodesForObject: (object) ->
    @cache.views[object.toKey()].nodes
