{forwardMethods} = Trix.Helpers

class Trix.Logger
  loggers = {}

  @getLoggers: ->
    logger for name, logger of loggers

  @get: (name) ->
    loggers[name] ?= new Trix.Logger(name, console)

  @log: (name, args...) ->
    @get(name).log(args...)

  forwardMethods ofObject: console, onConstructor: this, toProperty: "console"

  constructor: (@name, @console, enabled) ->
    @disable() unless enabled

  enable: ->
    if @disabledConsole? and not @isEnabled()
      @console = @disabledConsole
      delete @disabledConsole

  disable: ->
    if @isEnabled()
      @disabledConsole = @console
      delete @console

  isEnabled: ->
    @console?

  group: ->

  groupEnd: ->

  groupCollapsed: ->

  trace: ->
