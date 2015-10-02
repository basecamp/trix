class Trix.UndoManager extends Trix.BasicObject
  constructor: (@composition) ->
    @undoEntries = []
    @redoEntries = []

  recordUndoEntry: (description, {context, consolidatable} = {}) ->
    previousEntry = @undoEntries[-1..][0]

    unless consolidatable and entryHasDescriptionAndContext(previousEntry, description, context)
      undoEntry = @createEntry({description, context})
      @undoEntries.push(undoEntry)
      @redoEntries = []

  undo: ->
    if undoEntry = @undoEntries.pop()
      redoEntry = @createEntry(undoEntry)
      @redoEntries.push(redoEntry)
      @composition.loadSnapshot(undoEntry.snapshot)

  redo: ->
    if redoEntry = @redoEntries.pop()
      undoEntry = @createEntry(redoEntry)
      @undoEntries.push(undoEntry)
      @composition.loadSnapshot(redoEntry.snapshot)

  canUndo: ->
    @undoEntries.length > 0

  canRedo: ->
    @redoEntries.length > 0

  # Private

  createEntry: ({description, context} = {}) ->
    description: description?.toString()
    context: JSON.stringify(context)
    snapshot: @composition.getSnapshot()

  entryHasDescriptionAndContext = (entry, description, context) ->
    entry?.description is description?.toString() and entry?.context is JSON.stringify(context)
