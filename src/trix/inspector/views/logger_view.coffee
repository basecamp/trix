#= require trix/inspector/view

{handleEvent} = Trix

class Trix.Inspector.LoggersView extends Trix.Inspector.View
  constructor: ->
    @loggers = Trix.Logger.getLoggers()
    super

    handleEvent("change", onElement: @element, withCallback: @didChangeInput)

  didChangeInput: ({target}) =>
    logger = Trix.Logger.get(target.value)

    if target.checked
      logger.enable()
    else
      logger.disable()
