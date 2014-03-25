#= require trix/controllers/input_controller
#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/controllers/debug_controller
#= require trix/models/composition
#= require trix/models/text
#= require trix/observers/selection_observer

class Trix.EditorController
  constructor: (textElement, toolbarElement, debugElement) ->
    @text = new Trix.Text

    @textController = new Trix.TextController textElement, @text
    @textController.delegate = this

    @composition = new Trix.Composition @text
    @composition.delegate = this
    @composition.selectionDelegate = @textController

    @inputController = new Trix.InputController textElement
    @inputController.delegate = this
    @inputController.responder = @composition

    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this

    @toolbarController = new Trix.ToolbarController toolbarElement
    @toolbarController.delegate = this

    @debugController = new Trix.DebugController debugElement, @textController.textView, @composition
    @debugController.render()

  # Composition controller delegate

  compositionDidChangeCurrentAttributes: (composition, currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  # Text controller delegate

  textControllerDidRender: ->
    @debugController.render()

  textControllerDidFocus: ->
    @toolbarController.hideDialogsThatFocus()

  textControllerDidChangeSelection: ->
    @debugController.render()

  # Input controller delegate

  inputControllerWillComposeCharacters: ->
    @textController.lockSelection()

  inputControllerDidComposeCharacters: (composedString) ->
    @textController.render()
    @textController.unlockSelection()
    @composition.insertString(composedString)

  inputControllerDidInvalidateElement: (element) ->
    @textController.render()

  # Selection observer delegate

  selectionDidChange: (range) ->
    @textController.selectionDidChange(range)
    @composition.updateCurrentAttributes()
    @debugController.render()

  # Toolbar controller delegate

  toolbarDidToggleAttribute: (attributeName) ->
    @composition.toggleCurrentAttribute(attributeName)
    @textController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @composition.setCurrentAttribute(attributeName, value)
    @textController.focus()

  toolbarDidHideDialog: ->
    @textController.focus()

  toolbarWillShowDialog: ->
    @textController.lockSelection()
