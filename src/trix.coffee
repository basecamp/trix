#= require_self
#= require trix/controllers/editor_controller

@Trix =
  install: (config = {}) ->
    for key in "textarea toolbar input debug".split(" ")
      value = config[key]
      delete config[key]
      config["#{key}Element"] = getElement(value)

    config.textElement = createTextElementForTextarea(config.textareaElement)

    new Trix.EditorController config


getElement = (elementOrId) ->
  if typeof(elementOrId) is "string"
    document.getElementById(elementOrId)
  else
    elementOrId

createTextElementForTextarea = (textarea) ->
  element = document.createElement("div")
  element.innerHTML = textarea.value

  stylesToCopy = """
    width margin padding border border-radius
    outline position top left right bottom z-index
  """.split(" ")

  textareaStyle = window.getComputedStyle(textarea)
  element.style[style] = textareaStyle[style] for style in stylesToCopy
  element.style["min-height"] = textareaStyle["height"]

  textarea.style["display"] = "none"
  textarea.parentElement.insertBefore(element, textarea)

  element
