// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
