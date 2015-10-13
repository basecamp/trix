#= require trix/models/undo_manager

class Trix.Editor
  constructor: (@composition, @selectionManager) ->
    @undoManager = new Trix.UndoManager @composition

  loadDocument: (document) ->
    @loadSnapshot({document, selectedRange: [0, 0]})

  loadHTML: (html = "") ->
    @loadDocument(Trix.Document.fromHTML(html))

  loadJSON: ({document, selectedRange}) ->
    document = Trix.Document.fromJSON(document)
    @loadSnapshot({document, selectedRange})

  loadSnapshot: (snapshot) ->
    @undoManager = new Trix.UndoManager @composition
    @composition.loadSnapshot(snapshot)

  getDocument: ->
    @composition.document

  getSelectedDocument: ->
    @composition.getSelectedDocument()

  getSnapshot: ->
    @composition.getSnapshot()

  toJSON: ->
    @getSnapshot()

  # Document manipulation

  deleteInDirection: (direction) ->
    @composition.deleteInDirection(direction)

  insertDocument: (document) ->
    @composition.insertDocument(document)

  insertFile: (file) ->
    @composition.insertFile(file)

  insertHTML: (html) ->
    @composition.insertHTML(html)

  insertString: (string) ->
    @composition.insertString(string)

  insertText: (text) ->
    @composition.insertText(text)

  # Selection

  getSelectedRange: ->
    @composition.getSelectedRange()

  getPosition: ->
    @composition.getPosition()

  getClientRectAtPosition: (position) ->
    location = @getDocument().locationFromPosition(position)
    @selectionManager.getClientRectAtLocation(location)

  expandSelectionInDirection: (direction) ->
    @composition.expandSelectionInDirection(direction)

  moveCursorInDirection: (direction) ->
    @composition.moveCursorInDirection(direction)

  setSelectedRange: (selectedRange) ->
    @composition.setSelectedRange(selectedRange)

  # Current attributes

  getCurrentAttributes: ->
    @composition.getCurrentAttributes()

  getCurrentTextAttributes: ->
    @composition.getCurrentTextAttributes()

  hasCurrentAttribute: (name) ->
    @composition.hasCurrentAttribute(name)

  removeCurrentAttribute: (name) ->
    @composition.removeCurrentAttribute(name)

  setCurrentAttribute: (name, value) ->
    @composition.setCurrentAttribute(name, value)

  # Indentation level

  canDecreaseIndentationLevel: ->
    @composition.canDecreaseIndentationLevel()

  canIncreaseIndentationLevel: ->
    @composition.canIncreaseIndentationLevel()

  decreaseIndentationLevel: ->
    if @canDecreaseIndentationLevel()
      @composition.decreaseIndentationLevel()

  increaseIndentationLevel: ->
    if @canIncreaseIndentationLevel()
      @composition.increaseIndentationLevel()

  # Undo/redo

  canRedo: ->
    @undoManager.canRedo()

  canUndo: ->
    @undoManager.canUndo()

  recordUndoEntry: (description, {context, consolidatable} = {}) ->
    @undoManager.recordUndoEntry(description, {context, consolidatable})

  redo: ->
    if @canRedo()
      @undoManager.redo()

  undo: ->
    if @canUndo()
      @undoManager.undo()
