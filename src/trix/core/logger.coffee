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

  @proxyMethod "console?.log"
  @proxyMethod "console?.warn"
  @proxyMethod "console?.error"
  @proxyMethod "console?.group"
  @proxyMethod "console?.groupEnd"
  @proxyMethod "console?.groupCollapsed"
  @proxyMethod "console?.trace"
  @proxyMethod "console?.time"
  @proxyMethod "console?.timeEnd"
