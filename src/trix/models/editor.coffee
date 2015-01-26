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

  @proxy "attachmentManager.manageAttachment"
  @proxy "attachmentManager.unmanageAttachment"

  # Forward undo manager

  @proxy "undoManager.recordUndoEntry"
  @proxy "undoManager.undo"
  @proxy "undoManager.redo"
  @proxy "undoManager.canUndo"
  @proxy "undoManager.canRedo"

  # Forward composition delegate

  @proxy "delegate?.compositionDidChangeDocument"
  @proxy "delegate?.compositionDidChangeCurrentAttributes"
  @proxy "delegate?.compositionWillSetLocationRange"
  @proxy "delegate?.compositionShouldAcceptFile"
  @proxy "delegate?.compositionDidAddAttachment"
  @proxy "delegate?.compositionDidEditAttachment"
  @proxy "delegate?.compositionDidRemoveAttachment"
  @proxy "delegate?.compositionDidStartEditingAttachment"
  @proxy "delegate?.compositionDidStopEditingAttachment"
  @proxy "delegate?.getSelectionManager"

  # Forward attachment manager delegate

  @proxy "delegate?.attachmentManagerDidRequestRemovalOfAttachment"
