#= require trix/controllers/controller
#= require trix/controllers/input_controller
#= require trix/controllers/composition_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/selection_manager
#= require trix/models/document
#= require trix/models/composition
#= require trix/models/attachment_manager
#= require trix/models/undo_manager
#= require trix/models/editor

{rangeIsCollapsed, rangesAreEqual, objectsAreEqual} = Trix

class Trix.EditorController extends Trix.Controller
  constructor: ({@editorElement, document, html}) ->
    @selectionManager = new Trix.SelectionManager @editorElement
    @selectionManager.delegate = this

    @composition = new Trix.Composition
    @composition.delegate = this

    @attachmentManager = new Trix.AttachmentManager @composition.getAttachments()
    @attachmentManager.delegate = this

    @inputController = new Trix.InputController @editorElement
    @inputController.delegate = this
    @inputController.responder = @composition

    @compositionController = new Trix.CompositionController @editorElement, @composition
    @compositionController.delegate = this

    @toolbarController = new Trix.ToolbarController @editorElement.toolbarElement
    @toolbarController.delegate = this

    if document?
      @loadDocument(document)
    else
      @loadHTML(html)

  getEditor: ->
    new Trix.Editor this

  loadHTML: (html = "") ->
    @loadDocument(Trix.Document.fromHTML(html))

  loadDocument: (document) ->
    @loadSnapshot({document, selectedRange: [0, 0]})

  loadSnapshot: (snapshot) ->
    @loadingSnapshot = true
    @undoManager = new Trix.UndoManager @composition
    @composition.loadSnapshot(snapshot)

  loadJSON: ({document, selectedRange}) ->
    document = Trix.Document.fromJSON(document)
    @loadSnapshot({document, selectedRange})

  getSnapshot: ->
    @composition.getSnapshot()

  toJSON: ->
    @getSnapshot()

  registerSelectionManager: ->
    Trix.selectionChangeObserver.registerSelectionManager(@selectionManager)

  unregisterSelectionManager: ->
    Trix.selectionChangeObserver.unregisterSelectionManager(@selectionManager)

  # Composition delegate

  compositionDidChangeDocument: (document) ->
    @editorElement.notify("document-change")
    @render() unless @handlingInput

  compositionDidChangeCurrentAttributes: (@currentAttributes) ->
    @toolbarController.updateAttributes(@currentAttributes)
    @updateCurrentActions()
    @editorElement.notify("attributes-change", attributes: @currentAttributes)

  compositionDidPerformInsertionAtRange: (range) ->
    @pastedRange = range if @pasting

  compositionShouldAcceptFile: (file) ->
    @editorElement.notify("file-accept", {file})

  compositionDidAddAttachment: (attachment) ->
    managedAttachment = @attachmentManager.manageAttachment(attachment)
    @editorElement.notify("attachment-add", attachment: managedAttachment)

  compositionDidEditAttachment: (attachment) ->
    @compositionController.rerenderViewForObject(attachment)
    managedAttachment = @attachmentManager.manageAttachment(attachment)
    @editorElement.notify("attachment-edit", attachment: managedAttachment)

  compositionDidRemoveAttachment: (attachment) ->
    managedAttachment = @attachmentManager.unmanageAttachment(attachment)
    @editorElement.notify("attachment-remove", attachment: managedAttachment)

  compositionDidStartEditingAttachment: (attachment) ->
    document = @composition.document
    attachmentRange = document.getRangeOfAttachment(attachment)
    @attachmentLocationRange = document.locationRangeFromRange(attachmentRange)
    @compositionController.installAttachmentEditorForAttachment(attachment)
    @selectionManager.setLocationRange(@attachmentLocationRange)

  compositionDidStopEditingAttachment: (attachment) ->
    @compositionController.uninstallAttachmentEditor()
    @attachmentLocationRange = null

  compositionDidRequestChangingSelectionToLocationRange: (locationRange) ->
    return if @loadingSnapshot and not @isFocused()
    @requestedLocationRange = locationRange
    @documentWhenLocationRangeRequested = @composition.document
    @render() unless @handlingInput

  compositionDidLoadSnapshot: ->
    @compositionController.refreshViewCache()
    @render()
    @loadingSnapshot = false

  getSelectionManager: ->
    @selectionManager

  @proxyMethod "getSelectionManager().setLocationRange"
  @proxyMethod "getSelectionManager().getLocationRange"

  # Attachment manager delegate

  attachmentManagerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Document controller delegate

  compositionControllerWillSyncDocumentView: ->
    @inputController.editorWillSyncDocumentView()
    @selectionManager.lock()
    @selectionManager.clearSelection()

  compositionControllerDidSyncDocumentView: ->
    @inputController.editorDidSyncDocumentView()
    @selectionManager.unlock()
    @updateCurrentActions()
    @editorElement.notify("sync")

  compositionControllerDidRender: ->
    if @requestedLocationRange?
      if @documentWhenLocationRangeRequested.isEqualTo(@composition.document)
        @selectionManager.setLocationRange(@requestedLocationRange)
      @composition.updateCurrentAttributes()
      @requestedLocationRange = null
      @documentWhenLocationRangeRequested = null
    @editorElement.notify("render")

  compositionControllerDidFocus: ->
    @toolbarController.hideDialog()
    @editorElement.notify("focus")

  compositionControllerDidBlur: ->
    @editorElement.notify("blur")

  compositionControllerDidSelectAttachment: (attachment) ->
    @composition.editAttachment(attachment)

  compositionControllerDidRequestDeselectingAttachment: (attachment) ->
    if @attachmentLocationRange
      @selectionManager.setLocationRange(@attachmentLocationRange[1])

  compositionControllerWillUpdateAttachment: (attachment) ->
    @undoManager.recordUndoEntry("Edit Attachment", context: attachment.id, consolidatable: true)

  compositionControllerDidRequestRemovalOfAttachment: (attachment) ->
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
    @undoManager.recordUndoEntry("Cut")

  inputControllerWillPasteText: (pasteData) ->
    @undoManager.recordUndoEntry("Paste")
    @pasting = true

  inputControllerDidPaste: (pasteData) ->
    range = @pastedRange
    @pastedRange = null
    @pasting = null

    @editorElement.notify("paste", {pasteData, range})
    @render()

  inputControllerWillMoveText: ->
    @undoManager.recordUndoEntry("Move")

  inputControllerWillAttachFiles: ->
    @undoManager.recordUndoEntry("Drop Files")

  inputControllerDidReceiveKeyboardCommand: (keys) ->
    @toolbarController.applyKeyboardCommand(keys)

  inputControllerDidStartDrag: ->
    @locationRangeBeforeDrag = @selectionManager.getLocationRange()

  inputControllerDidReceiveDragOverPoint: (point) ->
    @selectionManager.setLocationRangeFromPoint(point)

  inputControllerDidCancelDrag: ->
    @selectionManager.setLocationRange(@locationRangeBeforeDrag)
    @locationRangeBeforeDrag = null

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @composition.updateCurrentAttributes()
    @updateCurrentActions()
    if @attachmentLocationRange and not rangesAreEqual(@attachmentLocationRange, locationRange)
      @composition.stopEditingAttachment()
    @editorElement.notify("selectionchange")

  # Toolbar controller delegate

  toolbarDidClickButton: ->
    @setLocationRange(index: 0, offset: 0) unless @getLocationRange()

  toolbarDidInvokeAction: (actionName) ->
    @invokeAction(actionName)

  toolbarDidToggleAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.toggleCurrentAttribute(attributeName)
    @render()
    @editorElement.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @recordFormattingUndoEntry()
    @composition.setCurrentAttribute(attributeName, value)
    @render()
    @editorElement.focus()

  toolbarDidRemoveAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.removeCurrentAttribute(attributeName)
    @render()
    @editorElement.focus()

  toolbarWillShowDialog: (dialogElement) ->
    @composition.expandSelectionForEditing()
    @freezeSelection()

  toolbarDidShowDialog: (dialogName) ->
    @editorElement.notify("toolbar-dialog-show", {dialogName})

  toolbarDidHideDialog: (dialogName) ->
    @editorElement.focus()
    @thawSelection()
    @editorElement.notify("toolbar-dialog-hide", {dialogName})

  # Selection

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
      @selectionFrozen = false
      @render()

  # Actions

  actions:
    undo:
      test: -> @undoManager.canUndo()
      perform: -> @undoManager.undo()
    redo:
      test: -> @undoManager.canRedo()
      perform: -> @undoManager.redo()
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
      perform: -> @compositionController.editAttachmentCaption()

  canInvokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      true
    else
      !! @actions[actionName]?.test?.call(this)

  invokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      @editorElement.notify("action-invoke", {actionName})
    else
      @actions[actionName]?.perform?.call(this)

  actionIsExternal: (actionName) ->
    /^x-./.test(actionName)

  getCurrentActions: ->
    result = {}
    for actionName of @actions
      result[actionName] = @canInvokeAction(actionName)
    result

  updateCurrentActions: ->
    currentActions = @getCurrentActions()
    unless objectsAreEqual(currentActions, @currentActions)
      @currentActions = currentActions
      @toolbarController.updateActions(@currentActions)
      @editorElement.notify("actions-change", actions: @currentActions)

  # Private

  reparse: ->
    @composition.replaceHTML(@editorElement.innerHTML)

  render: ->
    @compositionController.render()

  removeAttachment: (attachment) ->
    @undoManager.recordUndoEntry("Delete Attachment")
    @composition.removeAttachment(attachment)
    @render()

  recordFormattingUndoEntry: ->
    locationRange = @selectionManager.getLocationRange()
    unless rangeIsCollapsed(locationRange)
      @undoManager.recordUndoEntry("Formatting", context: @getUndoContext(), consolidatable: true)

  recordTypingUndoEntry: ->
    @undoManager.recordUndoEntry("Typing", context: @getUndoContext(@currentAttributes), consolidatable: true)

  getUndoContext: (context...) ->
    [@getLocationContext(), @getTimeContext(), context...]

  getLocationContext: ->
    locationRange = @selectionManager.getLocationRange()
    if rangeIsCollapsed(locationRange)
      locationRange[0].index
    else
      locationRange

  getTimeContext: ->
    if Trix.config.undoInterval > 0
      Math.floor(new Date().getTime() / Trix.config.undoInterval)
    else
      0

  isFocused: ->
    @editorElement is @editorElement.ownerDocument?.activeElement
