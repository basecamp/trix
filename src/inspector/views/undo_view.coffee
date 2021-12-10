import View from "inspector/view"

class UndoView extends View
  title: "Undo"
  template: "undo"
  events:
    "trix-change": ->
      @render()

  render: ->
    {@undoEntries, @redoEntries} = @editor.undoManager
    super(arguments...)

Trix.Inspector.registerView UndoView
