#= require ./inspector_panel_view

class Trix.UndoPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    {@undoManager} = @editorController

  getUndoEntries: ->
    @undoManager.undoEntries

  getRedoEntries: ->
    @undoManager.redoEntries

  render: ->
    undoStackElement = @renderStack(@getUndoEntries(), "Undo Stack")
    redoStackElement = @renderStack(@getRedoEntries(), "Redo Stack")

    @clear()
    @element.appendChild(undoStackElement)
    @element.appendChild(redoStackElement)

  renderStack: (entries, title) ->
    element = document.createElement("div")
    element.className = "trix-undo-stack"

    titleElement = document.createElement("h4")
    titleElement.textContent = title
    element.appendChild(titleElement)

    for entry in entries by -1
      entryElement = @renderEntry(entry)
      element.appendChild(entryElement)

    element

  renderEntry: (entry) ->
    element = document.createElement("div")
    element.className = "trix-undo-entry"
    element.textContent = "#{entry.description} #{entry.snapshot.selectedRange.inspect()}"
    element
