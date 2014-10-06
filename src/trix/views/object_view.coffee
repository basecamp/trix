#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.ObjectView
  constructor: (@object, @options = {}) ->
    @childViews = []
    @cache = views: {}

  render: ->
    @nodes ?= @createNodes()
    if @nodes.length is 1
      @nodes[0]
    else
      element = document.createDocumentFragment()
      element.appendChild(node) for node in @nodes
      element

  findOrCreateChildView: (viewClass, object, options) ->
    unless view = @cache.views[object.id]
      view = new viewClass object, options
      view.parentView = this
      view.cache = @cache
      @cache.views[object.id] = view
    @childViews.push(view) unless view in @childViews
    view

  getAllChildViews: ->
    views = []
    for childView in @childViews
      views.push(childView)
      views = views.concat(childView.getAllChildViews())
    views

  refreshCache: ->
    defer => @refreshViewCache()

  refreshViewCache: ->
    views = @getAllChildViews().concat(this)
    objectKeys = (view.object.id.toString() for view in views)
    delete @cache.views[key] for key of @cache.views when key not in objectKeys

  findObjectForNode: (node) ->
    return value.object for key, value of @cache.views when value.nodes and node in value.nodes

  findNodesForObject: (object) ->
    @cache.views[object.id].nodes
