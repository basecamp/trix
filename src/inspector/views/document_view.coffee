import View from "inspector/view"

Trix.Inspector.registerView class extends View
  title: "Document"
  template: "document"
  events:
    "trix-change": ->
      @render()

  render: ->
    @document = @editor.getDocument()
    super.render(arguments...)
