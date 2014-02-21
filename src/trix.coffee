#= require_self
#= require trix/editor_controller

@Trix =
  install: (textElement, toolbarElement) ->
    new Trix.EditorController textElement, toolbarElement
