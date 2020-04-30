#= require trix/controllers/controller
#= require trix/controllers/level_0_input_controller
#= require trix/controllers/level_2_input_controller
#= require trix/controllers/composition_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/composition
#= require trix/models/editor
#= require trix/models/attachment_manager
#= require trix/models/selection_manager

{rangeIsCollapsed, rangesAreEqual, objectsAreEqual, getBlockConfig} = Trix

class Trix.EditorController extends Trix.Controller
  constructor: ({@editorElement, document, html}) ->
    @selectionManager = new Trix.SelectionManager @editorElement
    @selectionManager.delegate = this

    @composition = new Trix.Composition
    @composition.delegate = this

    @attachmentManager = new Trix.AttachmentManager @composition.getAttachments()
    @attachmentManager.delegate = this

    @inputController = new Trix["Level#{Trix.config.input.getLevel()}InputController"](@editorElement)
    @inputController.delegate = this
    @inputController.responder = @composition

    @compositionController = new Trix.CompositionController @editorElement, @composition
    @compositionController.delegate = this

    @toolbarController = new Trix.ToolbarController @editorElement.toolbarElement
    @toolbarController.delegate = this

    @editor = new Trix.Editor @composition, @selectionManager, @editorElement
    if document?
      @editor.loadDocument(document)
    else
      @editor.loadHTML(html)

  registerSelectionManager: ->
    Trix.selectionChangeObserver.registerSelectionManager(@selectionManager)

  unregisterSelectionManager: ->
    Trix.selectionChangeObserver.unregisterSelectionManager(@selectionManager)

  render: ->
    @compositionController.render()

  reparse: ->
    @composition.replaceHTML(@editorElement.innerHTML)

  # Composition delegate

  compositionDidChangeDocument: (document) ->
    @notifyEditorElement("document-change")
    @render() unless @handlingInput

  compositionDidChangeCurrentAttributes: (@currentAttributes) ->
    @toolbarController.updateAttributes(@currentAttributes)
    @updateCurrentActions()
    @notifyEditorElement("attributes-change", attributes: @currentAttributes)

  compositionDidPerformInsertionAtRange: (range) ->
    @pastedRange = range if @pasting

  compositionShouldAcceptFile: (file) ->
    @notifyEditorElement("file-accept", {file})

  compositionDidAddAttachment: (attachment) ->
    managedAttachment = @attachmentManager.manageAttachment(attachment)
    @notifyEditorElement("attachment-add", attachment: managedAttachment)

  compositionDidEditAttachment: (attachment) ->
    @compositionController.rerenderViewForObject(attachment)
    managedAttachment = @attachmentManager.manageAttachment(attachment)
    @notifyEditorElement("attachment-edit", attachment: managedAttachment)
    @notifyEditorElement("change")

  compositionDidChangeAttachmentPreviewURL: (attachment) ->
    @compositionController.invalidateViewForObject(attachment)
    @notifyEditorElement("change")

  compositionDidRemoveAttachment: (attachment) ->
    managedAttachment = @attachmentManager.unmanageAttachment(attachment)
    @notifyEditorElement("attachment-remove", attachment: managedAttachment)

  compositionDidStartEditingAttachment: (attachment, options) ->
    @attachmentLocationRange = @composition.document.getLocationRangeOfAttachment(attachment)
    @compositionController.installAttachmentEditorForAttachment(attachment, options)
    @selectionManager.setLocationRange(@attachmentLocationRange)

  compositionDidStopEditingAttachment: (attachment) ->
    @compositionController.uninstallAttachmentEditor()
    @attachmentLocationRange = null

  compositionDidRequestChangingSelectionToLocationRange: (locationRange) ->
    return if @loadingSnapshot and not @isFocused()
    @requestedLocationRange = locationRange
    @compositionRevisionWhenLocationRangeRequested = @composition.revision
    @render() unless @handlingInput

  compositionWillLoadSnapshot: ->
    @loadingSnapshot = true

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
    @notifyEditorElement("sync")

  compositionControllerDidRender: ->
    if @requestedLocationRange?
      if @compositionRevisionWhenLocationRangeRequested is @composition.revision
        @selectionManager.setLocationRange(@requestedLocationRange)
      @requestedLocationRange = null
      @compositionRevisionWhenLocationRangeRequested = null

    unless @renderedCompositionRevision is @composition.revision
      @runEditorFilters()
      @composition.updateCurrentAttributes()
      @notifyEditorElement("render")

    @renderedCompositionRevision = @composition.revision

  compositionControllerDidFocus: ->
    @setLocationRange(index: 0, offset: 0) if @isFocusedInvisibly()
    @toolbarController.hideDialog()
    @notifyEditorElement("focus")

  compositionControllerDidBlur: ->
    @notifyEditorElement("blur")

  compositionControllerDidSelectAttachment: (attachment, options) ->
    @toolbarController.hideDialog()
    @composition.editAttachment(attachment, options)

  compositionControllerDidRequestDeselectingAttachment: (attachment) ->
    locationRange = @attachmentLocationRange ? @composition.document.getLocationRangeOfAttachment(attachment)
    @selectionManager.setLocationRange(locationRange[1])

  compositionControllerWillUpdateAttachment: (attachment) ->
    @editor.recordUndoEntry("Edit Attachment", context: attachment.id, consolidatable: true)

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

  inputControllerDidAllowUnhandledInput: ->
    @notifyEditorElement("change")

  inputControllerDidRequestReparse: ->
    @reparse()

  inputControllerWillPerformTyping: ->
    @recordTypingUndoEntry()

  inputControllerWillPerformFormatting: (attributeName) ->
    @recordFormattingUndoEntry(attributeName)

  inputControllerWillCutText: ->
    @editor.recordUndoEntry("Cut")

  inputControllerWillPaste: (paste) ->
    @editor.recordUndoEntry("Paste")
    @pasting = true
    @notifyEditorElement("before-paste", {paste})

  inputControllerDidPaste: (paste) ->
    paste.range = @pastedRange
    @pastedRange = null
    @pasting = null
    @notifyEditorElement("paste", {paste})

  inputControllerWillMoveText: ->
    @editor.recordUndoEntry("Move")

  inputControllerWillAttachFiles: ->
    @editor.recordUndoEntry("Drop Files")

  inputControllerWillPerformUndo: ->
    @editor.undo()

  inputControllerWillPerformRedo: ->
    @editor.redo()

  inputControllerDidReceiveKeyboardCommand: (keys) ->
    @toolbarController.applyKeyboardCommand(keys)

  inputControllerDidStartDrag: ->
    @locationRangeBeforeDrag = @selectionManager.getLocationRange()

  inputControllerDidReceiveDragOverPoint: (point) ->
    @selectionManager.setLocationRangeFromPointRange(point)

  inputControllerDidCancelDrag: ->
    @selectionManager.setLocationRange(@locationRangeBeforeDrag)
    @locationRangeBeforeDrag = null

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @composition.updateCurrentAttributes()
    @updateCurrentActions()
    if @attachmentLocationRange and not rangesAreEqual(@attachmentLocationRange, locationRange)
      @composition.stopEditingAttachment()
    @notifyEditorElement("selection-change")

  # Toolbar controller delegate

  toolbarDidClickButton: ->
    @setLocationRange(index: 0, offset: 0) unless @getLocationRange()

  toolbarDidInvokeAction: (actionName) ->
    @invokeAction(actionName)

  toolbarDidToggleAttribute: (attributeName) ->
    @recordFormattingUndoEntry(attributeName)
    @composition.toggleCurrentAttribute(attributeName)
    @render()
    @editorElement.focus() unless @selectionFrozen

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @recordFormattingUndoEntry(attributeName)
    @composition.setCurrentAttribute(attributeName, value)
    @render()
    @editorElement.focus() unless @selectionFrozen

  toolbarDidRemoveAttribute: (attributeName) ->
    @recordFormattingUndoEntry(attributeName)
    @composition.removeCurrentAttribute(attributeName)
    @render()
    @editorElement.focus() unless @selectionFrozen

  toolbarWillShowDialog: (dialogElement) ->
    @composition.expandSelectionForEditing()
    @freezeSelection()

  toolbarDidShowDialog: (dialogName) ->
    @notifyEditorElement("toolbar-dialog-show", {dialogName})

  toolbarDidHideDialog: (dialogName) ->
    @thawSelection()
    @editorElement.focus()
    @notifyEditorElement("toolbar-dialog-hide", {dialogName})

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
      test: -> @editor.canUndo()
      perform: -> @editor.undo()
    redo:
      test: -> @editor.canRedo()
      perform: -> @editor.redo()
    link:
      test: -> @editor.canActivateAttribute("href")
    increaseNestingLevel:
      test: -> @editor.canIncreaseNestingLevel()
      perform: -> @editor.increaseNestingLevel() and @render()
    decreaseNestingLevel:
      test: -> @editor.canDecreaseNestingLevel()
      perform: -> @editor.decreaseNestingLevel() and @render()
    attachFiles:
      test: -> true
      perform: -> Trix.config.input.pickFiles(@editor.insertFiles)

  canInvokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      true
    else
      !! @actions[actionName]?.test?.call(this)

  invokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      @notifyEditorElement("action-invoke", {actionName})
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
      @notifyEditorElement("actions-change", actions: @currentActions)

  # Editor filters

  runEditorFilters: ->
    snapshot = @composition.getSnapshot()

    for filter in @editor.filters
      {document, selectedRange} = snapshot
      snapshot = filter.call(@editor, snapshot) ? {}
      snapshot.document ?= document
      snapshot.selectedRange ?= selectedRange

    unless snapshotsAreEqual(snapshot, @composition.getSnapshot())
      @composition.loadSnapshot(snapshot)

  snapshotsAreEqual = (a, b) ->
    rangesAreEqual(a.selectedRange, b.selectedRange) and
      a.document.isEqualTo(b.document)

  # Private

  updateInputElement: ->
    element = @compositionController.getSerializableElement()
    value = Trix.serializeToContentType(element, "text/html")
    @editorElement.setInputElementValue(value)

  notifyEditorElement: (message, data) ->
    switch message
      when "document-change"
        @documentChangedSinceLastRender = true
      when "render"
        if @documentChangedSinceLastRender
          @documentChangedSinceLastRender = false
          @notifyEditorElement("change")
      when "change", "attachment-add", "attachment-edit", "attachment-remove"
        @updateInputElement()

    @editorElement.notify(message, data)

  removeAttachment: (attachment) ->
    @editor.recordUndoEntry("Delete Attachment")
    @composition.removeAttachment(attachment)
    @render()

  recordFormattingUndoEntry: (attributeName) ->
    blockConfig = getBlockConfig(attributeName)
    locationRange = @selectionManager.getLocationRange()
    if blockConfig or not rangeIsCollapsed(locationRange)
      @editor.recordUndoEntry("Formatting", context: @getUndoContext(), consolidatable: true)

  recordTypingUndoEntry: ->
    @editor.recordUndoEntry("Typing", context: @getUndoContext(@currentAttributes), consolidatable: true)

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

  # Detect "Cursor disappears sporadically" Firefox bug.
  # - https://bugzilla.mozilla.org/show_bug.cgi?id=226301
  isFocusedInvisibly: ->
    @isFocused() and not @getLocationRange()
