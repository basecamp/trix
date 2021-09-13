import Trix from "global"

import "inspector/view"

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Document"
  template: "document"
  events:
    "trix-change": ->
      @render()

  render: ->
    @document = @editor.getDocument()
    super.render(arguments...)
