#= require trix/inspector/view

class Trix.Inspector.UndoView extends Trix.Inspector.View
  events:
    "trix-change": ->
      @render()

  render: ->
    {@undoEntries, @redoEntries} = @editorController.undoManager
    super
