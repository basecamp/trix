import View from "inspector/view"

class DocumentView extends View {
  static title = "Document"
  static template = "document"
  static events = {
    "trix-change": function() {
      return this.render()
    },
  }

  render() {
    this.document = this.editor.getDocument()
    return super.render(...arguments)
  }
}

Trix.Inspector.registerView(DocumentView)
