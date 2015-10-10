class Trix.Editor
  constructor: ({@composition, @selectionManager, @undoManager}) ->

  getDocument: ->
    @composition.document

  getSelectedDocument: ->
    @composition.getSelectedDocument()

  # --

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

  # --

  getClientRectAtPosition: (position) ->
    location = @getDocument().locationFromPosition(position)
    @selectionManager.getClientRectAtLocation(location)

  getSelectedRange: ->
    @composition.getSelectedRange()

  expandSelectionInDirection: (direction) ->
    @composition.expandSelectionInDirection(direction)

  moveCursorInDirection: (direction) ->
    @composition.moveCursorInDirection(direction)

  setSelectedRange: (selectedRange) ->
    @composition.setSelectedRange(selectedRange)

  # --

  getCurrentAttributes: ->
    @composition.getCurrentAttributes()

  hasCurrentAttribute: (name) ->
    @composition.hasCurrentAttribute(name)

  removeCurrentAttribute: (name) ->
    @composition.removeCurrentAttribute(name)

  setCurrentAttribute: (name, value) ->
    @composition.setCurrentAttribute(name, value)

  # --

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

  # --

  canRedo: ->
    @undoManager.canRedo()

  canUndo: ->
    @undoManager.canUndo()

  redo: ->
    if @canRedo()
      @redo()

  undo: ->
    if @canUndo()
      @undo()
