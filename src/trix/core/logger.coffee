{forwardMethods} = Trix.Helpers

class Trix.Logger
  loggers = {}

  @get: (name) ->
    loggers[name] ?= new Trix.Logger(console)

  forwardMethods ofObject: console, onConstructor: this, toProperty: "console"

  constructor: (@console, enabled) ->
    @disable() unless enabled

  enable: ->
    if @disabledConsole? and not @console?
      @console = @disabledConsole
      delete @disabledConsole

  disable: ->
    if @console?
      @disabledConsole = @console
      delete @console
