{handleEvent} = Trix

class Trix.InspectorPanelView
  constructor: (@element, @editorController) ->
    @handlers = []
    {@editor} = @editorController

  destroy: ->
    @hide()
    handler.destroy() for handler in @handlers
    @handlers = null

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
