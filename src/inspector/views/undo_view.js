// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import View from "inspector/view"

class UndoView extends View {
  static initClass() {
    this.prototype.title = "Undo"
    this.prototype.template = "undo"
    this.prototype.events = {
      "trix-change"() {
        return this.render()
      },
    }
  }

  render() {
    this.undoEntries = this.editor.undoManager.undoEntries
    this.redoEntries = this.editor.undoManager.redoEntries
    return super.render(...arguments)
  }
}
UndoView.initClass()

Trix.Inspector.registerView(UndoView)
