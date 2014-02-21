#= require trix/text_controller
#= require trix/toolbar_controller

class Trix.EditorController
  constructor: (textElement, toolbarElement) ->
    @textController = new Trix.TextController textElement
    @textController.delegate = this
    @toolbarController = new Trix.ToolbarController toolbarElement

  # Text controller delegate

  currentAttributesDidChange: (currentAttributes) ->
    @toolbarController.updateAttributes(currentAttributes)
