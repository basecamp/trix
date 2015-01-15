class Trix.Resource
  constructor: (@url) ->
    @release()

  isLoading: ->
    @loading is true

  isLoaded: ->
    @loaded is true

  performWhenLoaded: (callback) ->
    @callbacks.push(callback)
    if @isLoaded()
      @performCallbacks()
    else
      @startLoading()

  performCallbacks: ->
    while callback = @callbacks.shift()
      try callback(this)

  startLoading: ->
    unless @loading
      @fetch =>
        delete @loading
        @loaded = true
        @performCallbacks()
      @loading = true

  fetch: ->

  release: ->
    @callbacks = []
    delete @loading
    delete @loaded
