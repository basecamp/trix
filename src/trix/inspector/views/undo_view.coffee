import Trix from "global"

import "inspector/view"

Trix.Inspector.registerView class extends Trix.Inspector.View
  title: "Undo"
  template: "undo"
  events:
    "trix-change": ->
      @render()

  render: ->
    {@undoEntries, @redoEntries} = @editor.undoManager
    super(arguments...)
