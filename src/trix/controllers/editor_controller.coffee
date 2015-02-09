#= require trix/controllers/controller
#= require trix/controllers/input_controller
#= require trix/controllers/document_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/selection_manager
#= require trix/models/editor

{defer} = Trix

class Trix.EditorController extends Trix.Controller
  constructor: (@config) ->
    {@documentElement, @toolbarElement, @document, @delegate} = @config
    @document ?= new Trix.Document

    @selectionManager = new Trix.SelectionManager @documentElement
    @selectionManager.delegate = this

    @setEditor(new Trix.Editor @document)

    if @config.autofocus
      @documentController.focus()
      @selectionManager.focus()

  setEditor: (editor) ->
    return if @editor is editor
    delete @editor?.delegate
    @editor = editor
    @editor.delegate = this

    @composition = @editor.composition
    @document = @composition.document

    @createInputController()
    @createToolbarController()
    @createDocumentController()
    @updateLocationRange()

    @delegate?.didSetEditor?(editor)
    @render()

  loadDocument: (document) ->
    return if @document is document
    @setEditor(new Trix.Editor document)

  # Composition delegate

  compositionDidChangeDocument: (document) ->
    @delegate?.didChangeDocument?(document)

  compositionDidChangeCurrentAttributes: (@currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)
    @toolbarController.updateActions()

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
    @attachmentLocationRange = @document.getLocationRangeOfAttachment(attachment)
    @documentController.installAttachmentEditorForAttachment(attachment)
    defer => @selectionManager.setLocationRange(@attachmentLocationRange)

  compositionDidStopEditingAttachment: (attachment) ->
    @documentController.uninstallAttachmentEditor()
    delete @attachmentLocationRange

  compositionDidRequestLocationRange: (locationRange) ->
    @requestedLocationRange = locationRange

  compositionDidRestoreSnapshot: ->
    @render()

  getSelectionManager: ->
    @selectionManager

  @proxyMethod "getSelectionManager().setLocationRange"
  @proxyMethod "getSelectionManager().getLocationRange"

  # Attachment manager delegate

  attachmentManagerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Document controller delegate

  documentControllerWillRenderDocumentElement: ->
    @inputController.editorWillRenderDocumentElement()
    if @requestedLocationRange?
      @selectionManager.lockToLocationRange(@requestedLocationRange)
    else
      @selectionManager.lock()
    @selectionManager.clearSelection()

  documentControllerDidRenderDocumentElement: ->
    @inputController.editorDidRenderDocumentElement()
    @selectionManager.unlock()
    @toolbarController.updateActions()
    @delegate?.didRenderDocumentElement?()

  documentControllerDidRender: ->
    delete @requestedLocationRange

  documentControllerDidFocus: ->
    @toolbarController.hideDialog()

  documentControllerDidSelectAttachment: (attachment) ->
    locationRange = @document.getLocationRangeOfAttachment(attachment)
    @composition.editAttachment(attachment)

  documentControllerWillUpdateAttachment: (attachment) ->
    @editor.recordUndoEntry("Edit Attachment", context: attachment.id, consolidatable: true)

  documentControllerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Input controller delegate

  inputControllerWillPerformTyping: ->
    @recordTypingUndoEntry()

  inputControllerWillCutText: ->
    @editor.recordUndoEntry("Cut")

  inputControllerWillPasteText: (paste) ->
    @editor.recordUndoEntry("Paste")
    @delegate?.didPaste?(paste)

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

  inputControllerDidThrowError: (error, details) ->
    @delegate?.didThrowError?(error, details)

  inputControllerDidRequestRender: ->
    @render()

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @editor.locationRange = locationRange
    @composition.updateCurrentAttributes()
    if @attachmentLocationRange and not @attachmentLocationRange.isEqualTo(locationRange)
      @composition.stopEditingAttachment()
    @delegate?.didChangeSelection?()

  # Toolbar controller delegate

  toolbarActions:
    undo:
      test: -> @editor.canUndo()
      perform: -> @editor.undo()
    redo:
      test: -> @editor.canRedo()
      perform: -> @editor.redo()
    link:
      test: -> @composition.canSetCurrentAttribute("href")
    increaseBlockLevel:
      test: -> @composition.canChangeBlockAttributeLevel()
      perform: -> @composition.increaseBlockAttributeLevel()
    decreaseBlockLevel:
      test: -> @composition.canChangeBlockAttributeLevel()
      perform: -> @composition.decreaseBlockAttributeLevel()

  toolbarCanInvokeAction: (actionName) ->
    @toolbarActions[actionName]?.test.call(this)

  toolbarDidInvokeAction: (actionName) ->
    @toolbarActions[actionName]?.perform?.call(this)

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

  toolbarWillShowDialog: (willFocus) ->
    @composition.expandSelectionForEditing()
    @freezeSelection() if willFocus

  toolbarDidHideDialog: ->
    @documentController.focus()
    @thawSelection()

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

  createToolbarController: ->
    unless @toolbarController
      @toolbarController = new Trix.ToolbarController @toolbarElement
      @toolbarController.delegate = this
    @toolbarController.updateActions()

  createDocumentController: ->
    delete @documentController?.delegate
    @documentController = new Trix.DocumentController @documentElement, @document
    @documentController.delegate = this
    @render()

  updateLocationRange: ->
    @setLocationRange(@editor.locationRange) if @editor.locationRange

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
