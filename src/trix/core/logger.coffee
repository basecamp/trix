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

  @forward "console?.log"
  @forward "console?.warn"
  @forward "console?.error"
  @forward "console?.group"
  @forward "console?.groupEnd"
  @forward "console?.groupCollapsed"
  @forward "console?.trace"
  @forward "console?.time"
  @forward "console?.timeEnd"
