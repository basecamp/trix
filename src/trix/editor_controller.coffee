#= require trix/text_controller
#= require trix/toolbar_controller

class Trix.EditorController
  constructor: (textElement, toolbarElement) ->
    @textController = new Trix.TextController textElement
    @toolbarController = new Trix.ToolbarController toolbarElement
