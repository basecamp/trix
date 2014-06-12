#= require trix/controllers/abstract_editor_controller
#= require trix/controllers/input_controller
#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/models/composition
#= require trix/models/undo_manager
#= require trix/observers/selection_observer
#= require trix/observers/mutation_observer

class Trix.EditorController extends Trix.AbstractEditorController
  initialize: ->
    @textController = new Trix.TextController @textElement, @text, @config
    @textController.delegate = this

    @composition = new Trix.Composition @text, @config
    @composition.delegate = this
    @composition.selectionDelegate = @textController

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

  compositionDidChangeText: (composition, text) ->
    @textController.render()
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
    @textController.lockSelection()

  inputControllerWillEndComposition: ->
    @textController.render()
    @textController.unlockSelection()
    @mutationObserver.start()

  inputControllerDidComposeCharacters: (composedString) ->
    @undoManager.recordUndoEntry("Typing", consolidatable: true)
    @composition.insertString(composedString)

  # Selection observer delegate

  selectionDidChange: (range) ->
    @textController.selectionDidChange(range)
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
    @textController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @undoManager.recordUndoEntry("Formatting", consolidatable: true)
    @composition.setCurrentAttribute(attributeName, value)
    @textController.focus()

  toolbarWillShowDialog: (wantsFocus) ->
    @dialogWantsFocus = wantsFocus
    @expandSelectionForEditing()
    @freezeSelection() if wantsFocus

  toolbarDidHideDialog: ->
    @textController.focus()
    @thawSelection()
    delete @dialogWantsFocus

  # Selection management

  freezeSelection: ->
    unless @selectionFrozen
      @textController.lockSelection()
      @composition.freezeSelection()
      @selectionFrozen = true

  thawSelection: ->
    if @selectionFrozen
      @textController.unlockSelection()
      @composition.thawSelection()
      delete @selectionFrozen

  expandSelectionForEditing: ->
    for key, value of Trix.attributes when value.parent
      if @composition.hasCurrentAttribute(key)
        @textController.expandSelectedRangeAroundCommonAttribute(key)
        break
