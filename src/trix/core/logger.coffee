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

  @proxy "console?.log"
  @proxy "console?.warn"
  @proxy "console?.error"
  @proxy "console?.group"
  @proxy "console?.groupEnd"
  @proxy "console?.groupCollapsed"
  @proxy "console?.trace"
  @proxy "console?.time"
  @proxy "console?.timeEnd"
