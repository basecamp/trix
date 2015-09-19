#= require trix/models/document
#= require trix/models/composition
#= require trix/models/attachment_manager
#= require trix/models/undo_manager

{normalizeRange} = Trix

class Trix.Editor extends Trix.Object
  @fromJSON: (json) ->
    document = Trix.Document.fromJSON(json.document)
    locationRange = normalizeRange(json.locationRange)
    new this document, locationRange

  constructor: (document, @locationRange) ->
    @composition = new Trix.Composition
    @composition.delegate = this
    @composition.setDocument(document)

    @attachmentManager = new Trix.AttachmentManager @composition.getAttachments()
    @attachmentManager.delegate = this

    @undoManager = new Trix.UndoManager @composition

  toJSON: ->
    document: @composition.document.toSerializableDocument()
    locationRange: @locationRange

  # Forward attachment manager

  @proxyMethod "attachmentManager.manageAttachment"
  @proxyMethod "attachmentManager.unmanageAttachment"
  @proxyMethod "attachmentManager.getAttachments"

  # Forward undo manager

  @proxyMethod "undoManager.recordUndoEntry"
  @proxyMethod "undoManager.undo"
  @proxyMethod "undoManager.redo"
  @proxyMethod "undoManager.canUndo"
  @proxyMethod "undoManager.canRedo"

  # Forward composition delegate

  @proxyMethod "delegate?.compositionDidChangeDocument"
  @proxyMethod "delegate?.compositionDidChangeCurrentAttributes"
  @proxyMethod "delegate?.compositionDidPerformInsertionAtRange"
  @proxyMethod "delegate?.compositionWillSetLocationRange"
  @proxyMethod "delegate?.compositionShouldAcceptFile"
  @proxyMethod "delegate?.compositionDidAddAttachment"
  @proxyMethod "delegate?.compositionDidEditAttachment"
  @proxyMethod "delegate?.compositionDidRemoveAttachment"
  @proxyMethod "delegate?.compositionDidStartEditingAttachment"
  @proxyMethod "delegate?.compositionDidStopEditingAttachment"
  @proxyMethod "delegate?.compositionDidRequestLocationRange"
  @proxyMethod "delegate?.compositionDidRestoreSnapshot"
  @proxyMethod "delegate?.getSelectionManager"

  # Forward attachment manager delegate

  @proxyMethod "delegate?.attachmentManagerDidRequestRemovalOfAttachment"
