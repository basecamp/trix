#= require ./inspector_panel_view

{defer} = Trix.Helpers

class Trix.LoggersPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    @handleEvent "click", onElement: @element, withCallback: @didClickPanel

  show: ->
    super
    defer => @render()

  render: ->
    loggers = (@renderLogger(logger) for logger in Trix.Logger.getLoggers())
    @element.innerHTML = loggers.join("")

  renderLogger: (logger) ->
    """
      <p><label>
        <input type="checkbox" value="#{logger.name}" #{" checked" if logger.isEnabled()}>
        #{logger.name}
      </label></p>
    """

  didClickPanel: =>
    for element in @element.querySelectorAll("input")
      logger = Trix.Logger.get(element.value)
      if element.checked
        logger.enable()
      else
        logger.disable()
