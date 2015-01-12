class Trix.ObjectView
  constructor: (@object, @options = {}) ->
    @childViews = []
    @rootView = this

  getNodes: ->
    @nodes ?= @createNodes()

  invalidate: ->
    delete @nodes
    @parentView?.invalidate()

  invalidateViewForObject: (object) ->
    @findViewForObject(object)?.invalidate()

  findOrCreateCachedChildView: (viewClass, object, options) ->
    if view = @getCachedViewForObject(object)
      @childViews.push(view) unless view in @childViews
    else
      view = @createChildView(arguments...)
      @cacheViewForObject(view, object)
    view

  createChildView: (viewClass, object, options = {}) ->
    if object instanceof Trix.ObjectGroup
      options.viewClass = viewClass
      viewClass = Trix.ObjectGroupView

    view = new viewClass object, options
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
    delete @shouldCacheViews

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
