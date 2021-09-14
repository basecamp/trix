import Trix from "trix/global"

import "inspector/polyfills/vendor/details-element-polyfill"
import "inspector/element"
import "inspector/control_element"
#= require_tree ./templates
import "inspector/views/debug_view"
import "inspector/views/document_view"
import "inspector/views/performance_view"
import "inspector/views/render_view"
import "inspector/views/selection_view"
import "inspector/views/undo_view"

Trix.Inspector =
  views: []

  registerView: (constructor) ->
    @views.push(constructor)

  install: (@editorElement) ->
    element = document.createElement("trix-inspector")
    element.dataset.trixId = @editorElement.trixId
    document.body.appendChild(element)
