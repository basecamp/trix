#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Performance"
  template: "performance"

  constructor: ->
    super
    {@documentView} = @compositionController

    @data = {}
    @track("documentView.render")
    @track("documentView.sync")
    @track("documentView.garbageCollectCachedViews")
    @track("composition.replaceHTML")

    @render()

  track: (methodPath) ->
    @data[methodPath] = calls: 0, total: 0, mean: 0, max: 0, last: 0

    [propertyNames..., methodName] = methodPath.split(".")
    object = this
    for propertyName in propertyNames
      object = object[propertyName]

    original = object[methodName]
    object[methodName] = =>
      started = now()
      result = original.apply(object, arguments)
      timing = now() - started
      @record(methodPath, timing)
      result

  record: (methodPath, timing) ->
    data = @data[methodPath]
    data.calls += 1
    data.total += timing
    data.mean = data.total / data.calls
    data.max = timing if timing > data.max
    data.last = timing
    @render()

  round: (ms) ->
    Math.round(ms * 1000) / 1000

  now =
    if window.performance?.now?
      -> performance.now()
    else
      -> new Date().getTime()
