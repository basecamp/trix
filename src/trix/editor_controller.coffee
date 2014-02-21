#= require trix/text_controller
#= require trix/toolbar_controller

class Trix.EditorController
  constructor: (textElement, toolbarElement) ->
    @textController = new Trix.TextController textElement
    @textController.delegate = this
    @toolbarController = new Trix.ToolbarController toolbarElement
    @toolbarController.delegate = this

  # Text controller delegate

  textControllerDidChangeCurrentAttributes: (currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)

  # Toolbar controller delegate

  didClickToolbarButtonForAttributeName: (attributeName) ->
    @textController.toggleCurrentAttribute(attributeName)
    @textController.focus()
