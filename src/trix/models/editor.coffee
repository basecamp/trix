#= require trix/models/undo_manager

class Trix.Editor
  constructor: (@composition, @selectionManager, @element) ->
    @undoManager = new Trix.UndoManager @composition

  loadDocument: (document) ->
    @loadSnapshot({document, selectedRange: [0, 0]})

  loadHTML: (html = "") ->
    @loadDocument(Trix.Document.fromHTML(html, referenceElement: @element))

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

  insertAttachment: (attachment) ->
    @composition.insertAttachment(attachment)

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

  insertLineBreak: ->
    @composition.insertLineBreak()

  # Selection

  getSelectedRange: ->
    @composition.getSelectedRange()

  getPosition: ->
    @composition.getPosition()

  getClientRectAtPosition: (position) ->
    locationRange = @getDocument().locationRangeFromRange([position, position + 1])
    @selectionManager.getClientRectAtLocationRange(locationRange)

  expandSelectionInDirection: (direction) ->
    @composition.expandSelectionInDirection(direction)

  moveCursorInDirection: (direction) ->
    @composition.moveCursorInDirection(direction)

  setSelectedRange: (selectedRange) ->
    @composition.setSelectedRange(selectedRange)

  # Attributes

  activateAttribute: (name, value = true) ->
    @composition.setCurrentAttribute(name, value)

  attributeIsActive: (name) ->
    @composition.hasCurrentAttribute(name)

  canActivateAttribute: (name) ->
    @composition.canSetCurrentAttribute(name)

  deactivateAttribute: (name) ->
    @composition.removeCurrentAttribute(name)

  # Indentation level

  canDecreaseIndentationLevel: ->
    @composition.canDecreaseBlockAttributeLevel()

  canIncreaseIndentationLevel: ->
    @composition.canIncreaseBlockAttributeLevel()

  decreaseIndentationLevel: ->
    if @canDecreaseIndentationLevel()
      @composition.decreaseBlockAttributeLevel()

  increaseIndentationLevel: ->
    if @canIncreaseIndentationLevel()
      @composition.increaseBlockAttributeLevel()

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
