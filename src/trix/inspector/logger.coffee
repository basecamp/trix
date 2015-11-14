class Trix.Inspector.Logger extends Trix.BasicObject
  loggers = {}

  @getLoggers: ->
    logger for name, logger of loggers

  @get: (name) ->
    loggers[name] ?= new Trix.Logger(name, console)

  @log: (name, args...) ->
    @get(name).log(args...)

  constructor: (@name, @console, enabled) ->
    enabled = readLoggerEnabledStateFromSessionStorage(@name) unless enabled?
    @disable() unless enabled

  enable: ->
    if @disabledConsole? and not @isEnabled()
      @console = @disabledConsole
      @disabledConsole = null
      writeLoggerEnabledStateToSessionStorage(@name, true)

  disable: ->
    if @isEnabled()
      @disabledConsole = @console
      @console = null
      writeLoggerEnabledStateToSessionStorage(@name, false)

  isEnabled: ->
    @console?

  readLoggerEnabledStateFromSessionStorage = (name) ->
    key = keyForLoggerName(name)
    window.sessionStorage?[key] is "true"

  writeLoggerEnabledStateToSessionStorage = (name, enabled) ->
    key = keyForLoggerName(name)
    if enabled
      window.sessionStorage?[key] = "true"
    else
      delete window.sessionStorage?[key]

  keyForLoggerName = (name) ->
    "trix/loggers/#{name}/enabled"

  @proxyMethod "console?.log"
  @proxyMethod "console?.warn"
  @proxyMethod "console?.error"
  @proxyMethod "console?.group"
  @proxyMethod "console?.groupEnd"
  @proxyMethod "console?.groupCollapsed"
  @proxyMethod "console?.trace"
  @proxyMethod "console?.time"
  @proxyMethod "console?.timeEnd"
