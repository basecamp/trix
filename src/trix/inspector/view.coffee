{handleEvent} = Trix

class Trix.Inspector.View
  constructor: (@editorElement) ->
    {@editorController, @editor} = @editorElement
    {@compositionController, @composition} = @editorController

    @element = document.createElement("details")
    @installEventHandlers() if @events

  installEventHandlers: ->
    for eventName, handler of @events then do (eventName, handler) =>
      handleEvent eventName, onElement: @editorElement, withCallback: (event) =>
        requestAnimationFrame =>
          handler.call(this, event)

  render: ->
    @element.innerHTML = JST["trix/inspector/templates/#{@template}"](this)
