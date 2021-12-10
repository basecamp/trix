window.Trix.Inspector =
  views: []

  registerView: (constructor) ->
    @views.push(constructor)

  install: (@editorElement) ->
    element = document.createElement("trix-inspector")
    element.dataset.trixId = @editorElement.trixId
    document.body.appendChild(element)
