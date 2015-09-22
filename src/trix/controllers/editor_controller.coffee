#= require trix/controllers/controller
#= require trix/controllers/input_controller
#= require trix/controllers/composition_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/selection_manager
#= require trix/models/editor

{rangeIsCollapsed, rangesAreEqual, objectsAreEqual} = Trix

class Trix.EditorController extends Trix.Controller
  constructor: (@config) ->
    {@documentElement, @toolbarController, document, @delegate} = @config
    document ?= new Trix.Document
    @toolbarController.delegate = this

    @selectionManager = new Trix.SelectionManager @documentElement
    @selectionManager.delegate = this

    @setEditor(new Trix.Editor document)
    @delegate?.didInitialize?()

  setEditor: (editor) ->
    return if @editor is editor
    @editor?.delegate = null
    @editor = editor
    @editor.delegate = this

    @composition = @editor.composition

    @selectionManager.delegate = null
    @createInputController()
    @createCompositionController()
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
    return if document is @composition.document
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
    @updateCurrentActions()
    @delegate?.didChangeAttributes?(@currentAttributes)

  compositionDidPerformInsertionAtRange: (range) ->
    @pastedRange = range if @pasting

  compositionShouldAcceptFile: (file) ->
    @delegate?.shouldAcceptFile?(file)

  compositionDidAddAttachment: (attachment) ->
    managedAttachment = @editor.manageAttachment(attachment)
    @delegate?.didAddAttachment?(managedAttachment)

  compositionDidEditAttachment: (attachment) ->
    @compositionController.rerenderViewForObject(attachment)
    managedAttachment = @editor.manageAttachment(attachment)
    @delegate?.didEditAttachment?(managedAttachment)

  compositionDidRemoveAttachment: (attachment) ->
    managedAttachment = @editor.unmanageAttachment(attachment)
    @delegate?.didRemoveAttachment?(managedAttachment)

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
    @requestedLocationRange = locationRange
    @documentWhenLocationRangeRequested = @composition.document
    @render() unless @handlingInput

  compositionDidRestoreSnapshot: ->
    @compositionController.refreshViewCache()
    @render()

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
    @delegate?.didSyncDocumentView?()

  compositionControllerDidRender: ->
    if @requestedLocationRange?
      if @documentWhenLocationRangeRequested.isEqualTo(@composition.document)
        @selectionManager.setLocationRange(@requestedLocationRange)
      @composition.updateCurrentAttributes()
      @requestedLocationRange = null
      @documentWhenLocationRangeRequested = null
    @delegate?.didRenderDocument?()

  compositionControllerDidFocus: ->
    @toolbarController.hideDialog()

  compositionControllerDidSelectAttachment: (attachment) ->
    @composition.editAttachment(attachment)

  compositionControllerDidRequestDeselectingAttachment: (attachment) ->
    if @attachmentLocationRange
      @selectionManager.setLocationRange(@attachmentLocationRange[1])

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

  inputControllerWillPerformTyping: ->
    @recordTypingUndoEntry()

  inputControllerWillCutText: ->
    @editor.recordUndoEntry("Cut")

  inputControllerWillPasteText: (pasteData) ->
    @editor.recordUndoEntry("Paste")
    @pasting = true

  inputControllerDidPaste: (pasteData) ->
    range = @pastedRange
    @pastedRange = null
    @pasting = null

    @delegate?.didPasteDataAtRange?(pasteData, range)
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
    @locationRangeBeforeDrag = null

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @editor.locationRange = locationRange
    @composition.updateCurrentAttributes()
    @updateCurrentActions()
    if @attachmentLocationRange and not rangesAreEqual(@attachmentLocationRange, locationRange)
      @composition.stopEditingAttachment()
    @delegate?.didChangeSelection?()

  # Toolbar controller delegate

  toolbarDidClickButton: ->
    @setLocationRange(index: 0, offset: 0) unless @getLocationRange()

  toolbarDidInvokeAction: (actionName) ->
    @invokeAction(actionName)

  toolbarDidToggleAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.toggleCurrentAttribute(attributeName)
    @render()
    @compositionController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @recordFormattingUndoEntry()
    @composition.setCurrentAttribute(attributeName, value)
    @render()
    @compositionController.focus()

  toolbarDidRemoveAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.removeCurrentAttribute(attributeName)
    @render()
    @compositionController.focus()

  toolbarWillShowDialog: (dialogElement) ->
    @composition.expandSelectionForEditing()
    @freezeSelection()

  toolbarDidShowDialog: (dialogElement) ->
    @delegate?.didShowToolbarDialog?(dialogElement)

  toolbarDidHideDialog: (dialogElement) ->
    @compositionController.focus()
    @thawSelection()
    @delegate?.didHideToolbarDialog?(dialogElement)

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

  getClientRectAtPosition: (position) ->
    location = @composition.document.locationFromPosition(position)
    [container, offset] = @selectionManager.findContainerAndOffsetFromLocation(location)

    range = document.createRange()
    range.setStart(container, offset)
    range.setEnd(container, offset + 1)

    rects = [range.getClientRects()...]
    rects[-1..][0]

  # Actions

  actions:
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
      perform: -> @compositionController.editAttachmentCaption()

  canInvokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      true
    else
      !! @actions[actionName]?.test?.call(this)

  invokeAction: (actionName) ->
    if @actionIsExternal(actionName)
      @delegate?.didInvokeExternalAction?(actionName)
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
      @delegate?.didChangeActions?(@currentActions)

  # Private

  createInputController: ->
    unless @inputController
      @inputController = new Trix.InputController @documentElement
      @inputController.delegate = this
    @inputController.responder = @composition

  createCompositionController: ->
    @compositionController?.delegate = null
    @compositionController = new Trix.CompositionController @documentElement, @composition
    @compositionController.delegate = this
    @render()

  reparse: ->
    @composition.replaceHTML(@documentElement.innerHTML)

  render: ->
    @compositionController.render()

  removeAttachment: (attachment) ->
    @editor.recordUndoEntry("Delete Attachment")
    @composition.removeAttachment(attachment)
    @render()

  recordFormattingUndoEntry: ->
    locationRange = @selectionManager.getLocationRange()
    unless rangeIsCollapsed(locationRange)
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
