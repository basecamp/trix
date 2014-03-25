#= require trix/controllers/text_controller
#= require trix/controllers/toolbar_controller
#= require trix/controllers/debug_controller

class Trix.EditorController
  constructor: (textElement, toolbarElement, inputElement, debugElement) ->
    @textController = new Trix.TextController textElement, createText(inputElement)
    @textController.delegate = this
    @toolbarController = new Trix.ToolbarController toolbarElement
    @toolbarController.delegate = this
    @debugController = new Trix.DebugController debugElement, @textController
    @debugController.render()

  createText = (inputElement) ->
    if inputElement?.value
      Trix.Text.fromJSON(inputElement.value)
    else
      new Trix.Text

  # Text controller delegate

  textControllerDidRender: ->
    @debugController.render()

  textControllerDidFocus: ->
    @toolbarController.hideDialogsThatFocus()

  textControllerDidChangeCurrentAttributes: (currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  textControllerDidChangeSelection: ->
    @debugController.render()

  # Toolbar controller delegate

  toolbarDidToggleAttribute: (attributeName) ->
    @textController.toggleCurrentAttribute(attributeName)
    @textController.focus()

  toolbarDidUpdateAttribute: (attributeName, value) ->
    @textController.setCurrentAttribute(attributeName, value)
    @textController.focus()

  toolbarDidHideDialog: ->
    @textController.focus()

  toolbarWillShowDialog: ->
    @textController.lockSelection()
