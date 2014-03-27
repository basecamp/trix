#= require_self
#= require trix/controllers/editor_controller

@Trix =
  install: (config = {}) ->
    new Trix.EditorController config
