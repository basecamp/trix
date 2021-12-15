// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import View from "inspector/view"

class UndoView extends View {
  static title = "Undo"
  static template = "undo"
  static events = {
    "trix-change": function() {
      return this.render()
    },
  }

  render() {
    this.undoEntries = this.editor.undoManager.undoEntries
    this.redoEntries = this.editor.undoManager.redoEntries
    return super.render(...arguments)
  }
}

Trix.Inspector.registerView(UndoView)
