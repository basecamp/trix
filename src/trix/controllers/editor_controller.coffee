#= require trix/controllers/input_controller
#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/controllers/debug_controller
#= require trix/models/composition
#= require trix/models/text
#= require trix/models/undo_manager
#= require trix/lib/dom
#= require trix/lib/selection_observer
#= require trix/lib/html_parser

class Trix.EditorController
  constructor: (@config) ->
    {@textElement, @toolbarElement, @textareaElement, @inputElement, @debugElement} = @config

    @text = @createText()

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

    @toolbarController = new Trix.ToolbarController @toolbarElement
    @toolbarController.delegate = this

    @debugController = new Trix.DebugController @debugElement, @textController.textView, @composition
    @debugController.render()

  createText: ->
    if @textElement.textContent.trim()
      Trix.Text.fromHTML(@textElement.innerHTML)
    else if @inputElement?.value
      Trix.Text.fromJSON(@inputElement.value)
    else
      new Trix.Text

  saveSerializedText: ->
    @textareaElement.value = @textElement.innerHTML
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @text.asJSON()

  # Composition controller delegate

  compositionDidChangeText: (composition, text) ->
    @textController.render()
    @saveSerializedText()

  compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  # Text controller delegate

  textControllerDidRender: ->
    @debugController.render()

  textControllerDidFocus: ->
    @toolbarController.hideDialog() if @dialogWantsFocus

  textControllerDidChangeSelection: ->
    @debugController.render()

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

  inputControllerWillComposeCharacters: ->
    @textController.lockSelection()

  inputControllerDidComposeCharacters: (composedString) ->
    @textController.render()
    @textController.unlockSelection()
    @undoManager.recordUndoEntry("Typing", consolidatable: true)
    @composition.insertString(composedString)

  # Selection observer delegate

  selectionDidChange: (range) ->
    @textController.selectionDidChange(range)
    @composition.updateCurrentAttributes()
    @debugController.render()

  # Toolbar controller delegate

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

  # Undo/redo

  undo: ->
    @undoManager.undo()

  redo: ->
    @undoManager.redo()
