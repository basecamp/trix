#= require trix/text_controller
#= require trix/toolbar_controller
#= require trix/debug_controller

class Trix.EditorController
  constructor: (textElement, toolbarElement, debugElement) ->
    @textController = new Trix.TextController textElement
    @textController.delegate = this
    @toolbarController = new Trix.ToolbarController toolbarElement
    @toolbarController.delegate = this
    @debugController = new Trix.DebugController debugElement, @textController
    @debugController.render()

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

  toolbarWillShowDialog: ->
    @textController.lockSelection()
