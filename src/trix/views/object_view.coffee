import BasicObject from "trix/core/basic_object"
import ObjectGroup from "trix/core/collections/object_group"

export default class ObjectView extends BasicObject
  constructor: (@object, @options = {}) ->
    super(arguments...)
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
    if object instanceof ObjectGroup
      options.viewClass = viewClass
      viewClass = ObjectGroupView

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
    if cache = @getViewCache()
      cache[object.getCacheKey()] = view

  garbageCollectCachedViews: ->
    if cache = @getViewCache()
      views = @getAllChildViews().concat(this)
      objectKeys = (view.object.getCacheKey() for view in views)
      delete cache[key] for key of cache when key not in objectKeys


export class ObjectGroupView extends ObjectView
  constructor: ->
    super(arguments...)
    @objectGroup = @object
    {@viewClass} = @options
    delete @options.viewClass

  getChildViews: ->
    unless @childViews.length
      for object in @objectGroup.getObjects()
        @findOrCreateCachedChildView(@viewClass, object, @options)
    @childViews

  createNodes: ->
    element = @createContainerElement()

    for view in @getChildViews()
      element.appendChild(node) for node in view.getNodes()

    [element]

  createContainerElement: (depth = @objectGroup.getDepth()) ->
    @getChildViews()[0].createContainerElement(depth)
