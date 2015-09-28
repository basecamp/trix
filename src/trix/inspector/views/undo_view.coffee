#= require trix/inspector/view

Trix.Inspector.registerView class extends Trix.Inspector.View
  name: "undo"
  title: "Undo"
  events:
    "trix-change": ->
      @render()

  render: ->
    {@undoEntries, @redoEntries} = @editorController.undoManager
    super
