class Trix.UndoManager
  constructor: (@composition) ->
    @undoEntries = []
    @redoEntries = []

  recordUndoEntry: (description, {consolidatable} = {}) ->
    previousEntry = @undoEntries[-1..][0]

    unless consolidatable and previousEntry?.description is description
      undoEntry = @createEntryWithDescription(description)
      @undoEntries.push(undoEntry)
      @redoEntries = []

  undo: ->
    if undoEntry = @undoEntries.pop()
      redoEntry = @createEntryWithDescription(undoEntry.description)
      @redoEntries.push(redoEntry)
      @composition.restoreSnapshot(undoEntry.snapshot)

  redo: ->
    if redoEntry = @redoEntries.pop()
      undoEntry = @createEntryWithDescription(redoEntry.description)
      @undoEntries.push(undoEntry)
      @composition.restoreSnapshot(redoEntry.snapshot)

  # Private

  createEntryWithDescription: (description) ->
    description: description
    snapshot: @composition.createSnapshot()
