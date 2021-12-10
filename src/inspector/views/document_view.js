import View from "inspector/view"

class DocumentView extends View
  title: "Document"
  template: "document"
  events:
    "trix-change": ->
      @render()

  render: ->
    @document = @editor.getDocument()
    super.render(arguments...)

Trix.Inspector.registerView DocumentView
