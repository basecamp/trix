import Trix from "trix/global"

import "trix/inspector/polyfills/vendor/details-element-polyfill"
import "trix/inspector/element"
import "trix/inspector/control_element"
#= require_tree ./templates
import "trix/inspector/views/debug_view"
import "trix/inspector/views/document_view"
import "trix/inspector/views/performance_view"
import "trix/inspector/views/render_view"
import "trix/inspector/views/selection_view"
import "trix/inspector/views/undo_view"

Trix.Inspector =
  views: []

  registerView: (constructor) ->
    @views.push(constructor)

  install: (@editorElement) ->
    element = document.createElement("trix-inspector")
    element.dataset.trixId = @editorElement.trixId
    document.body.appendChild(element)
