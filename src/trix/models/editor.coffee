#= require trix/models/document
#= require trix/models/composition
#= require trix/models/attachment_manager
#= require trix/models/undo_manager

class Trix.Editor
  constructor: (@document, @selectionManager) ->
    @composition = new Trix.Composition @document, @selectionManager
    @composition.delegate = this

    @attachmentManager = new Trix.AttachmentManager @composition
    @attachmentManager.delegate = this

    @undoManager = new Trix.UndoManager @composition

    @composition.loadDocument(@document)

  getLocationRange: ->
    @locationRange

  # Forward attachment manager

  manageAttachment: (attachment) ->
    @attachmentManager.manageAttachment(attachment)

  unmanageAttachment: (attachment) ->
    @attachmentManager.unmanageAttachment(attachment)

  # Forward undo manager

  recordUndoEntry: ->
    @undoManager.recordUndoEntry(arguments...)

  undo: ->
    @undoManager.undo()

  redo: ->
    @undoManager.redo()

  canUndo: ->
    @undoManager.canUndo()

  canRedo: ->
    @undoManager.canRedo()

  # Forward composition delegate

  compositionDidChangeDocument: (document) ->
    @delegate?.compositionDidChangeDocument?(document)

  compositionDidChangeCurrentAttributes: (currentAttributes) ->
    @delegate?.compositionDidChangeCurrentAttributes?(currentAttributes)

  compositionWillSetLocationRange: ->
    @delegate?.compositionWillSetLocationRange?()

  compositionShouldAcceptFile: (file) ->
    @delegate?.compositionShouldAcceptFile?(file)

  compositionDidAddAttachment: (attachment) ->
    @delegate?.compositionDidAddAttachment?(attachment)

  compositionDidEditAttachment: (attachment) ->
    @delegate?.compositionDidEditAttachment?(attachment)

  compositionDidRemoveAttachment: (attachment) ->
    @delegate?.compositionDidRemoveAttachment?(attachment)

  compositionDidStartEditingAttachment: (attachment) ->
    @delegate?.compositionDidStartEditingAttachment?(attachment)

  compositionDidStopEditingAttachment: (attachment) ->
    @delegate?.compositionDidStopEditingAttachment?(attachment)

  # Forward attachment manager delegate

  attachmentManagerDidRequestRemovalOfAttachment: (attachment) ->
    @delegate?.attachmentManagerDidRequestRemovalOfAttachment?(attachment)
