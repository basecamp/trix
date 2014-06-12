#= require trix/controllers/abstract_editor_controller
#= require trix/controllers/input_controller
#= require trix/controllers/document_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/composition
#= require trix/models/undo_manager
#= require trix/observers/selection_observer
#= require trix/observers/mutation_observer

class Trix.EditorController extends Trix.AbstractEditorController
  initialize: ->
    @documentController = new Trix.DocumentController @textElement, @document, @config
    @documentController.delegate = this

    @composition = new Trix.Composition @document, @config
    @composition.delegate = this
    @composition.selectionDelegate = @documentController

    @undoManager = new Trix.UndoManager @composition

    @inputController = new Trix.InputController @textElement
    @inputController.delegate = this
    @inputController.responder = @composition

    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

    @mutationObserver = new Trix.MutationObserver @textElement
    @mutationObserver.delegate = this

    @toolbarController = new Trix.ToolbarController @toolbarElement
    @toolbarController.delegate = this
    @toolbarController.updateActions()

  # Composition controller delegate

  compositionDidChangeDocument: (composition, document) ->
    @documentController.render()
    @saveSerializedText()
    @toolbarController.updateActions()

  compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  # Text controller delegate

  textControllerWillRender: ->
    @mutationObserver.stop()

  textControllerDidRender: ->
    @mutationObserver.start()
    @delegate?.didRenderText?()

  textControllerDidFocus: ->
    @toolbarController.hideDialog() if @dialogWantsFocus

  textControllerDidChangeSelection: ->
    @delegate?.didChangeSelection?()

  textControllerWillResizeAttachment: ->
    @undoManager.recordUndoEntry("Resize", consolidatable: true)

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
    @documentController.lockSelection()

  inputControllerWillEndComposition: ->
    @documentController.render()
    @documentController.unlockSelection()
    @mutationObserver.start()

  inputControllerDidComposeCharacters: (composedString) ->
    @undoManager.recordUndoEntry("Typing", consolidatable: true)
    @composition.insertString(composedString)

  # Selection observer delegate

  selectionDidChange: (range) ->
    @documentController.selectionDidChange(range)
    @composition.updateCurrentAttributes()
    @delegate?.didChangeSelection?()

  # Mutation observer delegate

  elementDidMutate: (mutations) ->
    @composition.replaceHTML(@textElement.innerHTML)

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
    @expandSelectionForEditing()
    @freezeSelection() if wantsFocus

  toolbarDidHideDialog: ->
    @documentController.focus()
    @thawSelection()
    delete @dialogWantsFocus

  # Selection management

  freezeSelection: ->
    unless @selectionFrozen
      @documentController.lockSelection()
      @composition.freezeSelection()
      @selectionFrozen = true

  thawSelection: ->
    if @selectionFrozen
      @documentController.unlockSelection()
      @composition.thawSelection()
      delete @selectionFrozen

  expandSelectionForEditing: ->
    for key, value of Trix.attributes when value.parent
      if @composition.hasCurrentAttribute(key)
        @documentController.expandSelectedRangeAroundCommonAttribute(key)
        break
