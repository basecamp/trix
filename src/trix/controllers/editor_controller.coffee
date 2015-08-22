#= require trix/controllers/controller
#= require trix/controllers/input_controller
#= require trix/controllers/document_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/selection_manager
#= require trix/models/editor

class Trix.EditorController extends Trix.Controller
  constructor: (@config) ->
    {@documentElement, @toolbarController, @document, @delegate} = @config
    @document ?= new Trix.Document
    @toolbarController.delegate = this

    @selectionManager = new Trix.SelectionManager @documentElement
    @selectionManager.delegate = this

    @setEditor(new Trix.Editor @document)

  setEditor: (editor) ->
    return if @editor is editor
    delete @editor?.delegate
    @editor = editor
    @editor.delegate = this

    @composition = @editor.composition
    @document = @composition.document

    @selectionManager.delegate = null
    @createInputController()
    @createDocumentController()
    @selectionManager.delegate = this

    for managedAttachment in @editor.getAttachments()
      @delegate?.didAddAttachment?(managedAttachment)

    if @editor.locationRange?
      @setLocationRange(@editor.locationRange)
    else
      @composition.updateCurrentAttributes()

    @render()
    @delegate?.didSetEditor?(editor)

  loadDocument: (document) ->
    return if @document is document
    @setEditor(new Trix.Editor document)

  registerSelectionManager: ->
    Trix.selectionChangeObserver.registerSelectionManager(@selectionManager)

  unregisterSelectionManager: ->
    Trix.selectionChangeObserver.unregisterSelectionManager(@selectionManager)

  # Composition delegate

  compositionDidChangeDocument: (document) ->
    @delegate?.didChangeDocument?(document)
    @render() unless @handlingInput

  compositionDidChangeCurrentAttributes: (@currentAttributes) ->
    @toolbarController.updateAttributes(@currentAttributes)
    @toolbarController.updateActions()

  compositionDidPerformInsertionAtPositionRange: (positionRange) ->
    @pastedPositionRange = positionRange if @pasting

  compositionShouldAcceptFile: (file) ->
    @delegate?.shouldAcceptFile?(file)

  compositionDidAddAttachment: (attachment) ->
    managedAttachment = @editor.manageAttachment(attachment)
    @delegate?.didAddAttachment?(managedAttachment)

  compositionDidEditAttachment: (attachment) ->
    @documentController.rerenderViewForObject(attachment)
    managedAttachment = @editor.manageAttachment(attachment)
    @delegate?.didEditAttachment?(managedAttachment)

  compositionDidRemoveAttachment: (attachment) ->
    managedAttachment = @editor.unmanageAttachment(attachment)
    @delegate?.didRemoveAttachment?(managedAttachment)

  compositionDidStartEditingAttachment: (attachment) ->
    attachmentPositionRange = @document.getPositionRangeOfAttachment(attachment)
    @attachmentLocationRange = @document.locationRangeFromPositionRange(attachmentPositionRange)
    @documentController.installAttachmentEditorForAttachment(attachment)
    @selectionManager.setLocationRange(@attachmentLocationRange)

  compositionDidStopEditingAttachment: (attachment) ->
    @documentController.uninstallAttachmentEditor()
    delete @attachmentLocationRange

  compositionDidRequestLocationRange: (locationRange) ->
    @requestedLocationRange = locationRange
    @editCountWhenLocationRangeRequested = @document.getEditCount()
    @render() unless @handlingInput

  compositionDidRestoreSnapshot: ->
    @documentController.refreshViewCache()
    @render()

  getSelectionManager: ->
    @selectionManager

  @proxyMethod "getSelectionManager().setLocationRange"
  @proxyMethod "getSelectionManager().getLocationRange"

  # Attachment manager delegate

  attachmentManagerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Document controller delegate

  documentControllerWillSyncDocumentView: ->
    @inputController.editorWillSyncDocumentView()
    @selectionManager.lock()
    @selectionManager.clearSelection()

  documentControllerDidSyncDocumentView: ->
    @inputController.editorDidSyncDocumentView()
    @selectionManager.unlock()
    @toolbarController.updateActions()
    @delegate?.didSyncDocumentView?()

  documentControllerDidRender: ->
    if @requestedLocationRange?
      if @editCountWhenLocationRangeRequested is @document.getEditCount()
        @selectionManager.setLocationRange(@requestedLocationRange)
      @composition.updateCurrentAttributes()
      delete @requestedLocationRange
      delete @editCountWhenLocationRangeRequested
    @delegate?.didRenderDocument?()

  documentControllerDidFocus: ->
    @toolbarController.hideDialog()

  documentControllerDidSelectAttachment: (attachment) ->
    @composition.editAttachment(attachment)

  documentControllerDidRequestDeselectingAttachment: (attachment) ->
    if @attachmentLocationRange
      @selectionManager.setLocationRange(@attachmentLocationRange.end)

  documentControllerWillUpdateAttachment: (attachment) ->
    @editor.recordUndoEntry("Edit Attachment", context: attachment.id, consolidatable: true)

  documentControllerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Input controller delegate

  inputControllerWillHandleInput: ->
    @handlingInput = true
    @requestedRender = false

  inputControllerDidRequestRender: ->
    @requestedRender = true

  inputControllerDidHandleInput: ->
    @handlingInput = false
    if @requestedRender
      @requestedRender = false
      @render()

  inputControllerWillPerformTyping: ->
    @recordTypingUndoEntry()

  inputControllerWillCutText: ->
    @editor.recordUndoEntry("Cut")

  inputControllerWillPasteText: (pasteData) ->
    @editor.recordUndoEntry("Paste")
    @pasting = true

  inputControllerDidPaste: (pasteData) ->
    positionRange = @pastedPositionRange
    delete @pastedPositionRange
    delete @pasting

    @delegate?.didPasteDataAtPositionRange?(pasteData, positionRange)
    @render()

  inputControllerWillMoveText: ->
    @editor.recordUndoEntry("Move")

  inputControllerWillAttachFiles: ->
    @editor.recordUndoEntry("Drop Files")

  inputControllerDidReceiveKeyboardCommand: (keys) ->
    @toolbarController.applyKeyboardCommand(keys)

  inputControllerDidStartDrag: ->
    @locationRangeBeforeDrag = @selectionManager.getLocationRange()

  inputControllerDidReceiveDragOverPoint: (point) ->
    @selectionManager.setLocationRangeFromPoint(point)

  inputControllerDidCancelDrag: ->
    @selectionManager.setLocationRange(@locationRangeBeforeDrag)
    delete @locationRangeBeforeDrag

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @editor.locationRange = locationRange
    @composition.updateCurrentAttributes()
    if @attachmentLocationRange and not @attachmentLocationRange.isEqualTo(locationRange)
      @composition.stopEditingAttachment()
    @delegate?.didChangeSelection?()

  # Toolbar controller delegate

  @toolbarActions:
    undo:
      test: -> @editor.canUndo()
      perform: -> @editor.undo()
    redo:
      test: -> @editor.canRedo()
      perform: -> @editor.redo()
    link:
      test: -> @composition.canSetCurrentAttribute("href")
    increaseBlockLevel:
      test: -> @composition.canIncreaseBlockAttributeLevel()
      perform: -> @composition.increaseBlockAttributeLevel() and @render()
    decreaseBlockLevel:
      test: -> @composition.canDecreaseBlockAttributeLevel()
      perform: -> @composition.decreaseBlockAttributeLevel() and @render()
    editCaption:
      test: -> @composition.canEditAttachmentCaption()
      perform: -> @documentController.editAttachmentCaption()

  toolbarDidClickButton: ->
    @setLocationRange([0, 0]) unless @getLocationRange()

  toolbarCanInvokeAction: (actionName) ->
    if toolbarActionIsExternal(actionName)
      true
    else
      @constructor.toolbarActions[actionName]?.test?.call(this)

  toolbarDidInvokeAction: (actionName) ->
    if toolbarActionIsExternal(actionName)
      @delegate?.didInvokeExternalAction?(actionName)
    else
      @constructor.toolbarActions[actionName]?.perform?.call(this)

  toolbarDidToggleAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.toggleCurrentAttribute(attributeName)
    @render()
    @documentController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @recordFormattingUndoEntry()
    @composition.setCurrentAttribute(attributeName, value)
    @render()
    @documentController.focus()

  toolbarDidRemoveAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.removeCurrentAttribute(attributeName)
    @render()
    @documentController.focus()

  toolbarWillShowDialog: (dialogElement) ->
    @composition.expandSelectionForEditing()
    @freezeSelection()

  toolbarDidShowDialog: (dialogElement) ->
    @delegate?.didShowToolbarDialog?(dialogElement)

  toolbarDidHideDialog: (dialogElement) ->
    @documentController.focus()
    @thawSelection()
    @delegate?.didHideToolbarDialog?(dialogElement)

  toolbarActionIsExternal = (actionName) ->
    /^x-./.test(actionName)

  # Selection management

  freezeSelection: ->
    unless @selectionFrozen
      @selectionManager.lock()
      @composition.freezeSelection()
      @selectionFrozen = true
      @render()

  thawSelection: ->
    if @selectionFrozen
      @composition.thawSelection()
      @selectionManager.unlock()
      delete @selectionFrozen
      @render()

  getLocationContext: ->
    locationRange = @selectionManager.getLocationRange()
    if locationRange?.isCollapsed() then locationRange.index else locationRange

  # Private

  createInputController: ->
    unless @inputController
      @inputController = new Trix.InputController @documentElement
      @inputController.delegate = this
    @inputController.responder = @composition

  createDocumentController: ->
    delete @documentController?.delegate
    @documentController = new Trix.DocumentController @documentElement, @document
    @documentController.delegate = this
    @render()

  reparse: ->
    @composition.replaceHTML(@documentElement.innerHTML)

  render: ->
    @documentController.render()

  removeAttachment: (attachment) ->
    @editor.recordUndoEntry("Delete Attachment")
    @composition.removeAttachment(attachment)
    @render()

  recordFormattingUndoEntry: ->
    locationRange = @selectionManager.getLocationRange()
    unless locationRange?.isCollapsed()
      @editor.recordUndoEntry("Formatting", context: @getLocationContext(), consolidatable: true)

  recordTypingUndoEntry: ->
    context = [@getLocationContext(), JSON.stringify(@currentAttributes)]
    @editor.recordUndoEntry("Typing", context: context, consolidatable: true)
