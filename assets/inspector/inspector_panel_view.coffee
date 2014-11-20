{handleEvent} = Trix.DOM

class Trix.InspectorPanelView
  constructor: (@element, @editorController) ->
    @handlers = []

  destroy: ->
    @hide()
    handler.destroy() for handler in @handlers
    delete @handlers

  handleEvent: ->
    @handlers.push(handleEvent(arguments...))

  render: ->

  show: ->
    @render()
    @element.style.display = "block"

  hide: ->
    @element.style.display = ""

  clear: ->
    @element.removeChild(@element.firstChild) while @element.firstChild
