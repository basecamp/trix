#= require_self
#= require trix/controllers/editor_controller

@Trix =
  install: (textElement, toolbarElement, inputElement, debugElement) ->
    new Trix.EditorController textElement, toolbarElement, inputElement, debugElement
