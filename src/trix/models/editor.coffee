#= require trix/models/document
#= require trix/models/composition
#= require trix/models/attachment_manager
#= require trix/models/undo_manager

class Trix.Editor extends Trix.Object
  @fromJSON: (json) ->
    document = Trix.Document.fromJSON(json.document)
    locationRange = Trix.LocationRange.fromJSON(json.locationRange) if json.locationRange?
    new this document, locationRange

  constructor: (@document, @locationRange) ->
    @composition = new Trix.Composition @document
    @composition.delegate = this

    @attachmentManager = new Trix.AttachmentManager @composition
    @attachmentManager.delegate = this

    @undoManager = new Trix.UndoManager @composition

    @composition.loadDocument(@document)

  toJSON: ->
    document: @document.toSerializableDocument()
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
