{forwardMethod} = Trix.Helpers

class Trix.Logger extends Trix.BasicObject
  loggers = {}

  @getLoggers: ->
    logger for name, logger of loggers

  @get: (name) ->
    loggers[name] ?= new Trix.Logger(name, console)

  @log: (name, args...) ->
    @get(name).log(args...)

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

  forwardMethod "log", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "warn", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "error", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "trace", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "group", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "groupEnd", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "groupCollapsed", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "trace", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "time", onConstructor: this, toProperty: "console", optional: true
  forwardMethod "timeEnd", onConstructor: this, toProperty: "console", optional: true
