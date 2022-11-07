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
