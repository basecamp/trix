class Trix.Observer
  start: ->
    unless @started
      for eventInfo in @getObservedEvents()
        @on eventInfo...
      @started = true

  stop: ->
    if @started
      for eventInfo in @getObservedEvents()
        @off eventInfo...
      @started = false

  getObservedEvents: ->
    []

  on: (eventName, handler, useCapture) ->
    @element.addEventListener eventName, handler, useCapture

  off: (eventName, handler, useCapture) ->
    @element.removeEventListener eventName, handler, useCapture
