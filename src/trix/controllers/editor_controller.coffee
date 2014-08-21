#= require trix/controllers/abstract_editor_controller
#= require trix/controllers/input_controller
#= require trix/controllers/document_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/composition
#= require trix/models/undo_manager
#= require trix/models/selection_manager
#= require trix/observers/mutation_observer

class Trix.EditorController extends Trix.AbstractEditorController
  constructor: ->
    super
    @document.initializeManagedAttachmentsWithDelegate(@delegate)

    @selectionManager = new Trix.SelectionManager @documentElement
    @selectionManager.delegate = this

    @documentController = new Trix.DocumentController @documentElement, @document
    @documentController.delegate = this

    @composition = new Trix.Composition @document
    @composition.delegate = this
    @composition.selectionDelegate = @selectionManager

    @undoManager = new Trix.UndoManager @composition

    @inputController = new Trix.InputController @documentElement
    @inputController.delegate = this
    @inputController.responder = @composition

    @mutationObserver = new Trix.MutationObserver @documentElement
    @mutationObserver.delegate = this

    @toolbarController = new Trix.ToolbarController @toolbarElement
    @toolbarController.delegate = this
    @toolbarController.updateActions()

    # Focus last to ensure all focus event handlers are triggered
    @documentController.focus() if @config.autofocus

  # Composition controller delegate

  compositionDidChangeDocument: (composition, document) ->
    @documentController.render()
    @saveSerializedText()
    @toolbarController.updateActions()

  compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  compositionWillSetLocationRange: ->
    @skipSelectionLock = true

  # Document controller delegate

  documentControllerWillRender: ->
    @mutationObserver.stop()
    @selectionManager.lock() unless @skipSelectionLock

  documentControllerDidRender: ->
    @mutationObserver.start()
    @selectionManager.unlock() unless @skipSelectionLock
    delete @skipSelectionLock
    @delegate?.didRenderDocument?()

  documentControllerDidFocus: ->
    @toolbarController.hideDialog() if @dialogWantsFocus

  documentControllerWillEditAttachment: ->
    @undoManager.recordUndoEntry("Edit Attachment", consolidatable: true)

  # Input controller delegate

  inputControllerWillPerformTyping: ->
    @undoManager.recordUndoEntry("Typing", consolidatable: true)

  inputControllerWillCutText: ->
    @undoManager.recordUndoEntry("Cut")

  inputControllerWillPasteText: ->
    @undoManager.recordUndoEntry("Paste")

  inputControllerWillMoveText: ->
    @undoManager.recordUndoEntry("Move")

  inputControllerWillAttachFiles: ->
    @undoManager.recordUndoEntry("Drop Files")

  inputControllerWillStartComposition: ->
    @mutationObserver.stop()
    @selectionManager.lock()

  inputControllerWillEndComposition: ->
    @documentController.render()
    @selectionManager.unlock()
    @mutationObserver.start()

  inputControllerDidComposeCharacters: (composedString) ->
    @undoManager.recordUndoEntry("Typing", consolidatable: true)
    @composition.insertString(composedString)

  # Selection manager delegate

  locationRangeDidChange: (locationRange) ->
    @composition.updateCurrentAttributes()
    @delegate?.didChangeSelection?()

  # Mutation observer delegate

  elementDidMutate: (mutations) ->
    @composition.replaceHTML(@documentElement.innerHTML)

  # Toolbar controller delegate

  toolbarActions:
    undo:
      test: -> @undoManager.canUndo()
      perform: -> @undoManager.undo()
    redo:
      test: -> @undoManager.canRedo()
      perform: -> @undoManager.redo()

  toolbarCanInvokeAction: (actionName) ->
    @toolbarActions[actionName]?.test.call(this)

  toolbarDidInvokeAction: (actionName) ->
    @toolbarActions[actionName]?.perform.call(this)

  toolbarDidToggleAttribute: (attributeName) ->
    @undoManager.recordUndoEntry("Formatting", consolidatable: true)
    @composition.toggleCurrentAttribute(attributeName)
    @documentController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @undoManager.recordUndoEntry("Formatting", consolidatable: true)
    @composition.setCurrentAttribute(attributeName, value)
    @documentController.focus()

  toolbarWillShowDialog: (wantsFocus) ->
    @dialogWantsFocus = wantsFocus
    @composition.expandSelectionForEditing()
    @freezeSelection() if wantsFocus

  toolbarDidHideDialog: ->
    @documentController.focus()
    @thawSelection()
    delete @dialogWantsFocus

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
