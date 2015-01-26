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
    document: @document
    locationRange: @locationRange

  # Forward attachment manager

  @forward "attachmentManager.manageAttachment"
  @forward "attachmentManager.unmanageAttachment"

  # Forward undo manager

  @forward "undoManager.recordUndoEntry"
  @forward "undoManager.undo"
  @forward "undoManager.redo"
  @forward "undoManager.canUndo"
  @forward "undoManager.canRedo"

  # Forward composition delegate

  @forward "delegate?.compositionDidChangeDocument"
  @forward "delegate?.compositionDidChangeCurrentAttributes"
  @forward "delegate?.compositionWillSetLocationRange"
  @forward "delegate?.compositionShouldAcceptFile"
  @forward "delegate?.compositionDidAddAttachment"
  @forward "delegate?.compositionDidEditAttachment"
  @forward "delegate?.compositionDidRemoveAttachment"
  @forward "delegate?.compositionDidStartEditingAttachment"
  @forward "delegate?.compositionDidStopEditingAttachment"
  @forward "delegate?.getSelectionManager"

  # Forward attachment manager delegate

  @forward "delegate?.attachmentManagerDidRequestRemovalOfAttachment"
