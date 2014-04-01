#= require trix/controllers/editor_controller
#= require trix/controllers/input_controller

class Trix.Installer
  constructor: (@config = {}) ->

  createEditor: ->
    if @browserIsSupported()
      @getConfigElements()
      @config.textElement = @createTextElement()
      @config.autofocus ?= @config.textareaElement.hasAttribute("autofocus")
      @createStyleSheet()

      new Trix.EditorController @config

  browserIsSupported: ->
    true

  getConfigElements: ->
    for key in "textarea toolbar input debug".split(" ")
      @config["#{key}Element"] = getElement(@config[key])
      delete @config[key]

  styleSheetId = "trix-styles"

  createStyleSheet: ->
    if !document.getElementById(styleSheetId) and css = Trix.config.editorCSS
      element = document.createElement("style")
      element.setAttribute("type", "text/css")
      element.setAttribute("id", styleSheetId)
      element.appendChild(document.createTextNode(css))
      document.querySelector("head").appendChild(element)

  textareaStylesToCopy = "
    width margin padding border border-radius
    outline position top left right bottom z-index
    color background
  ".split(" ")

  createTextElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.innerHTML = textarea.value
    element.classList.add(name) for name in @classNames()

    element.setAttribute("contenteditable", "true")
    element.setAttribute("autocorrect", "off")
    element.setAttribute("spellcheck", "false")

    if placeholder = textarea.getAttribute("placeholder")
      element.setAttribute("data-placeholder", placeholder)

    textareaStyle = window.getComputedStyle(textarea)
    element.style[style] = textareaStyle[style] for style in textareaStylesToCopy
    element.style["min-height"] = textareaStyle["height"]

    disableObjectResizingOnFocus(element)
    proxyInputEvents(element, textarea)

    textarea.style["display"] = "none"
    textarea.parentElement.insertBefore(element, textarea)

    element

  classNames: ->
    result = ["trix-editor"]
    if @config.className
      for name in @config.className.split(" ")
        result.push(name)
    result

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

  proxyInputEvents = (from, to) ->
    for eventName in Trix.InputController.eventNames()
      from.addEventListener eventName, (event) ->
        copy = new event.constructor event.type
        setTimeout ->
          to.dispatchEvent(copy)
        , 1
