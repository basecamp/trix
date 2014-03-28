#= require trix/controllers/editor_controller

class Trix.Installer
  constructor: (@config = {}) ->
    for key in "textarea toolbar input debug".split(" ")
      @config["#{key}Element"] = getElement(@config[key])
      delete @config[key]

    @config.focus ?= @config.textareaElement.hasAttribute("autofocus")

  createEditor: ->
    if @browserIsSupported()
      @createTextElement()
      new Trix.EditorController @config

  browserIsSupported: ->
    true

  textareaStylesToCopy = "
    width margin padding border border-radius
    outline position top left right bottom z-index
  ".split(" ")

  createTextElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.innerHTML = textarea.value
    element.classList.add("trix-editor")
    element.setAttribute("data-placeholder", textarea.getAttribute("placeholder"))
    element.setAttribute("contenteditable", "true")
    element.setAttribute("autocorrect", "off")
    element.setAttribute("spellcheck", "false")
    disableObjectResizingOnFocus(element)

    textareaStyle = window.getComputedStyle(textarea)
    element.style[style] = textareaStyle[style] for style in textareaStylesToCopy
    element.style["min-height"] = textareaStyle["height"]

    textarea.style["display"] = "none"
    textarea.parentElement.insertBefore(element, textarea)

    @config.textElement = element

  getElement = (elementOrId) ->
    if typeof(elementOrId) is "string"
      document.getElementById(elementOrId)
    else
      elementOrId

  disableObjectResizingOnFocus = (element) ->
    if element instanceof FocusEvent
      event = element
      document.execCommand("enableObjectResizing", false, "false")
      event.target.removeEventListener("focus", disableObjectResizingOnFocus)
    else
      element.addEventListener("focus", disableObjectResizingOnFocus)
