#= require_self
#= require trix/controllers/editor_controller

@Trix =
  install: (config = {}) ->
    for key in "text toolbar input debug".split(" ")
      value = config[key]
      delete config[key]
      config["#{key}Element"] = getElement(value)

    new Trix.EditorController config


getElement = (elementOrId) ->
  if typeof(elementOrId) is "string"
    document.getElementById(elementOrId)
  else
    elementOrId
