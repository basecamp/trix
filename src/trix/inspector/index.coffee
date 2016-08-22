#= require_tree ./polyfills
#= require_self
#= require ./element
#= require ./control_element
#= require_tree ./templates
#= require_tree ./views

Trix.Inspector =
  views: []

  registerView: (constructor) ->
    @views.push(constructor)

  install: (@editorElement) ->
    element = document.createElement("trix-inspector")
    element.dataset.trixId = @editorElement.trixId
    document.body.appendChild(element)
