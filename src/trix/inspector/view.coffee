{handleEvent} = Trix

class Trix.Inspector.View
  constructor: (@editorElement, @element, @template) ->
    {@editorController, @composition} = @editorElement
    {@compositionController} = @editorController
    @render()
    @installEventHandlers() if @events

  installEventHandlers: ->
    for eventName, handler of @events then do (eventName, handler) =>
      handleEvent eventName, onElement: @editorElement, withCallback: (event) =>
        requestAnimationFrame =>
          handler.call(this, event)

  render: ->
    @element.innerHTML = JST["trix/inspector/templates/#{@template}"](this)
