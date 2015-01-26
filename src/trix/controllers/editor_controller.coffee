#= require trix/controllers/abstract_editor_controller
#= require trix/controllers/input_controller
#= require trix/controllers/document_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/selection_manager
#= require trix/models/editor
#= require trix/observers/mutation_observer

class Trix.EditorController extends Trix.AbstractEditorController
  constructor: ->
    super

    @selectionManager = new Trix.SelectionManager @documentElement
    @selectionManager.delegate = this

    @setEditor(new Trix.Editor @document)

    @documentController.focus() if @config.autofocus

  setEditor: (editor) ->
    return if @editor is editor
    delete @editor?.delegate
    @editor = editor
    @editor.delegate = this

    @composition = @editor.composition
    @document = @composition.document

    @createMutationObserver()
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
    @documentController.render()
    @delegate?.didChangeDocument?(document)

  compositionDidChangeCurrentAttributes: (@currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)
    @toolbarController.updateActions()

  compositionWillSetLocationRange: ->
    @skipSelectionLock = true

  compositionShouldAcceptFile: (file) ->
    @delegate?.shouldAcceptFile?(file)

  compositionDidAddAttachment: (attachment) ->
    managedAttachment = @editor.manageAttachment(attachment)
    @delegate?.didAddAttachment?(managedAttachment)

  compositionDidEditAttachment: (attachment) ->
    @documentController.rerenderViewForObject(attachment)

  compositionDidRemoveAttachment: (attachment) ->
    managedAttachment = @editor.unmanageAttachment(attachment)
    @delegate?.didRemoveAttachment?(managedAttachment)

  compositionDidStartEditingAttachment: (attachment) ->
    @attachmentLocationRange = @document.getLocationRangeOfAttachment(attachment)
    @documentController.installAttachmentEditorForAttachment(attachment)
    @selectionManager.setLocationRange(@attachmentLocationRange)

  compositionDidStopEditingAttachment: (attachment) ->
    @documentController.uninstallAttachmentEditor()
    delete @attachmentLocationRange

  getSelectionManager: ->
    @selectionManager

  # Attachment manager delegate

  attachmentManagerDidRequestRemovalOfAttachment: (attachment) ->
    @removeAttachment(attachment)

  # Document controller delegate

  documentControllerWillRender: ->
    @mutationObserver.stop()
    @selectionManager.lock() unless @skipSelectionLock
    @selectionManager.clearSelection()

  documentControllerDidRender: ->
    @mutationObserver.start()
    @selectionManager.unlock() unless @skipSelectionLock
    delete @skipSelectionLock
    @saveSerializedDocument()
    @toolbarController.updateActions()
    @delegate?.didRenderDocument?()

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

  inputControllerWillStartComposition: ->
    @mutationObserver.stop()
    @selectionManager.lock()

  inputControllerWillEndComposition: ->
    @documentController.render()
    @selectionManager.unlock()
    @mutationObserver.start()

  inputControllerDidComposeCharacters: (composedString) ->
    @recordTypingUndoEntry()
    @composition.insertString(composedString)

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

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @editor.locationRange = locationRange
    @composition.updateCurrentAttributes()
    if @attachmentLocationRange and not @attachmentLocationRange.isEqualTo(locationRange)
      @composition.stopEditingAttachment()
    @delegate?.didChangeSelection?()

  # Mutation observer delegate

  elementDidMutate: (mutations) ->
    try
      @composition.replaceHTML(@documentElement.innerHTML)
    catch error
      @delegate?.didThrowError?(error, {mutations})
      throw error

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
    @documentController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @recordFormattingUndoEntry()
    @composition.setCurrentAttribute(attributeName, value)
    @documentController.focus()

  toolbarDidRemoveAttribute: (attributeName) ->
    @recordFormattingUndoEntry()
    @composition.removeCurrentAttribute(attributeName)
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

  thawSelection: ->
    if @selectionFrozen
      @composition.thawSelection()
      @selectionManager.unlock()
      delete @selectionFrozen

  getLocationContext: ->
    locationRange = @selectionManager.getLocationRange()
    if locationRange?.isCollapsed() then locationRange.index else locationRange

  # Private

  createMutationObserver: ->
    return if @mutationObserver
    @mutationObserver = new Trix.MutationObserver @documentElement
    @mutationObserver.delegate = this

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
    @documentController.render()

  updateLocationRange: ->
    @selectionManager.setLocationRange(@editor.locationRange) if @editor.locationRange

  render: ->
    @documentController.render()

  removeAttachment: (attachment) ->
    @editor.recordUndoEntry("Delete Attachment")
    @composition.removeAttachment(attachment)

  recordFormattingUndoEntry: ->
    locationRange = @selectionManager.getLocationRange()
    unless locationRange?.isCollapsed()
      @editor.recordUndoEntry("Formatting", context: @getLocationContext(), consolidatable: true)

  recordTypingUndoEntry: ->
    context = [@getLocationContext(), JSON.stringify(@currentAttributes)]
    @editor.recordUndoEntry("Typing", context: context, consolidatable: true)
