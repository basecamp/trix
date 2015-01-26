#= require trix/models/document
#= require trix/models/composition
#= require trix/models/attachment_manager
#= require trix/models/undo_manager

{forwardMethod, forwardDelegateMethod} = Trix.Helpers

class Trix.Editor
  constructor: (@document) ->
    @composition = new Trix.Composition @document
    @composition.delegate = this

    @attachmentManager = new Trix.AttachmentManager @composition
    @attachmentManager.delegate = this

    @undoManager = new Trix.UndoManager @composition

    @composition.loadDocument(@document)

  # Forward attachment manager

  forwardMethod "manageAttachment", onConstructor: this, toProperty: "attachmentManager"
  forwardMethod "unmanageAttachment", onConstructor: this, toProperty: "attachmentManager"

  # Forward undo manager

  forwardMethod "recordUndoEntry", onConstructor: this, toProperty: "undoManager"
  forwardMethod "undo", onConstructor: this, toProperty: "undoManager"
  forwardMethod "redo", onConstructor: this, toProperty: "undoManager"
  forwardMethod "canUndo", onConstructor: this, toProperty: "undoManager"
  forwardMethod "canRedo", onConstructor: this, toProperty: "undoManager"

  # Forward composition delegate

  forwardDelegateMethod "compositionDidChangeDocument", onConstructor: this
  forwardDelegateMethod "compositionDidChangeCurrentAttributes", onConstructor: this
  forwardDelegateMethod "compositionWillSetLocationRange", onConstructor: this
  forwardDelegateMethod "compositionShouldAcceptFile", onConstructor: this
  forwardDelegateMethod "compositionDidAddAttachment", onConstructor: this
  forwardDelegateMethod "compositionDidEditAttachment", onConstructor: this
  forwardDelegateMethod "compositionDidRemoveAttachment", onConstructor: this
  forwardDelegateMethod "compositionDidStartEditingAttachment", onConstructor: this
  forwardDelegateMethod "compositionDidStopEditingAttachment", onConstructor: this
  forwardDelegateMethod "getSelectionManager", onConstructor: this

  # Forward attachment manager delegate

  forwardDelegateMethod "attachmentManagerDidRequestRemovalOfAttachment", onConstructor: this
