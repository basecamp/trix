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

  invalidate: ->
    delete @nodes
    @parentView?.invalidate()

  invalidateViewForObject: (object) ->
    @findViewForObject(object)?.invalidate()

  findOrCreateCachedChildView: (viewClass, object, options) ->
    if view = @cache.views[object.toKey()]
      @childViews.push(view) unless view in @childViews
    else
      view = @createChildView(arguments...)
      @cache.views[object.toKey()] = view
    view

  createChildView: (viewClass, object, options) ->
    view = new viewClass object, options
    view.parentView = this
    view.cache = @cache
    @childViews.push(view)
    view

  getAllChildViews: ->
    views = []
    for childView in @childViews
      views.push(childView)
      views = views.concat(childView.getAllChildViews())
    views

  garbageCollectCachedViews: ->
    views = @getAllChildViews().concat(this)
    objectKeys = (view.object.toKey() for view in views)
    delete @cache.views[key] for key of @cache.views when key not in objectKeys

  findObjectForNode: (node) ->
    return view.object for view in @getAllChildViews() when view.nodes?[0] is node

  findViewForObject: (object) ->
    return view for view in @getAllChildViews() when view.object is object

  findNodesForObject: (object) ->
    @findViewForObject(object)?.nodes
