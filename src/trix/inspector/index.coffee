#= require_self
#= require_tree ./templates
#= require_tree ./views
#= require ./element

class Trix.Inspector
  constructor: (editorElement) ->
    @view = new Trix.Inspector.InspectorView editorElement, document.createElement("trix-inspector"), "inspector"
    document.body.appendChild(@view.element)
