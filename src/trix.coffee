#= require_self
#= require trix/controllers/editor_controller

@Trix =
  install: (textElement, toolbarElement, debugElement) ->
    new Trix.EditorController textElement, toolbarElement, debugElement
