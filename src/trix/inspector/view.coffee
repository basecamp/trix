{handleEvent} = Trix

class Trix.Inspector.View
  name: null
  title: null
  position: 2

  constructor: ({@editorElement, @element}) ->
    {@editorController, @composition} = @editorElement
    {@compositionController} = @editorController

    @setElement(@element) if @element
    @installEventHandlers() if @events

  setElement: (@element) ->
    @contentElement = @element.querySelector("[data-content]") ? @element
    @titleElement = @element.querySelector("[data-title]")

  installEventHandlers: ->
    for eventName, handler of @events then do (eventName, handler) =>
      handleEvent eventName, onElement: @editorElement, withCallback: (event) =>
        requestAnimationFrame =>
          handler.call(this, event)

  render: ->
    @contentElement?.innerHTML = JST["trix/inspector/templates/#{@name}"](this)
    @titleElement?.textContent = @title
