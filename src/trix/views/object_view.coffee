#= require_self
#= require trix/views/object_group_view

class Trix.ObjectView extends Trix.BasicObject
  constructor: (@object, @options = {}) ->
    @childViews = []
    @rootView = this

  getNodes: ->
    @nodes ?= @createNodes()
    node.cloneNode(true) for node in @nodes

  invalidate: ->
    @nodes = null
    @childViews = []
    @parentView?.invalidate()

  invalidateViewForObject: (object) ->
    @findViewForObject(object)?.invalidate()

  findOrCreateCachedChildView: (viewClass, object, options) ->
    if view = @getCachedViewForObject(object)
      @recordChildView(view)
    else
      view = @createChildView(arguments...)
      @cacheViewForObject(view, object)
    view

  createChildView: (viewClass, object, options = {}) ->
    if object instanceof Trix.ObjectGroup
      options.viewClass = viewClass
      viewClass = Trix.ObjectGroupView

    view = new viewClass object, options
    @recordChildView(view)

  recordChildView: (view) ->
    view.parentView = this
    view.rootView = @rootView
    @childViews.push(view)
    view

  getAllChildViews: ->
    views = []
    for childView in @childViews
      views.push(childView)
      views = views.concat(childView.getAllChildViews())
    views

  findElement: ->
    @findElementForObject(@object)

  findElementForObject: (object) ->
    if id = object?.id
      @rootView.element.querySelector("[data-trix-id='#{id}']")

  findViewForObject: (object) ->
    return view for view in @getAllChildViews() when view.object is object

  getViewCache: ->
    if @rootView is this
      if @isViewCachingEnabled()
        @viewCache ?= {}
    else
      @rootView.getViewCache()

  isViewCachingEnabled: ->
    @shouldCacheViews isnt false

  enableViewCaching: ->
    @shouldCacheViews = true

  disableViewCaching: ->
    @shouldCacheViews = false

  getCachedViewForObject: (object) ->
    @getViewCache()?[object.getCacheKey()]

  cacheViewForObject: (view, object) ->
    @getViewCache()?[object.getCacheKey()] = view

  garbageCollectCachedViews: ->
    if cache = @getViewCache()
      views = @getAllChildViews().concat(this)
      objectKeys = (view.object.getCacheKey() for view in views)
      delete cache[key] for key of cache when key not in objectKeys
