#= require trix/controllers/editor_controller
#= require trix/controllers/simple_editor_controller

class Trix.Installer
  requiredFeatures =
    simple:
      "addEventListener": document
      "createTreeWalker": document
      "getComputedStyle": window
      "getSelection": window

    full:
      "MutationObserver": window

  @getSupportedModes: ->
    simple = true

    for feature, element of requiredFeatures.simple when feature not of element
      simple = false
      break

    if full = simple
      for feature, element of requiredFeatures.full when feature not of element
        full = false
        break

    {simple, full}

  constructor: (@config = {}) ->
    @config.mode ?= "full"
    @config.useInputEvents = @deviceSupportsCanceledInputEvents()

  browserHasRequiredFeatures: ->
    @constructor.getSupportedModes()[@config.mode]

  # Devices with a virtual keyboard don't respond well to canceled input events.
  # On iOS for example, the shift key remains active and autocorrect doesn't work.
  # There's no easy way to detect these devices so this may need revisiting.
  deviceSupportsCanceledInputEvents: ->
    not "ontouchstart" of window

  createEditor: ->
    if @browserHasRequiredFeatures()
      @getConfigElements()
      @config.textElement = @createTextElement()
      @config.autofocus ?= @config.textareaElement.hasAttribute("autofocus")
      @createStyleSheet()

      if @config.mode is "simple"
        new Trix.SimpleEditorController @config
      else
        new Trix.EditorController @config

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

  textareaStylesToCopy = "width position top left right bottom zIndex color".split(" ")
  textareaStylePatternToCopy = /(border|outline|padding|margin|background)[A-Z]+/

  createTextElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.innerHTML = textarea.value
    element.classList.add(name) for name in @classNames()

    element.setAttribute("contenteditable", "true")
    element.setAttribute("autocorrect", "off")

    if placeholder = textarea.getAttribute("placeholder")
      element.setAttribute("data-placeholder", placeholder)

    textareaStyle = window.getComputedStyle(textarea)

    for style in textareaStylesToCopy
      element.style[style] = textareaStyle[style]

    for key, value of textareaStyle when value and textareaStylePatternToCopy.test(key)
      element.style[key] = value

    element.style["minHeight"] = textareaStyle["height"]

    disableObjectResizing(element)

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

  disableObjectResizing = (element) ->
    if element instanceof FocusEvent
      event = element
      document.execCommand("enableObjectResizing", false, false)
      event.target.removeEventListener("focus", disableObjectResizing)
    else
      element.addEventListener("focus", disableObjectResizing, true)
      element.addEventListener("mscontrolselect", cancelEvent, true)

  cancelEvent = (event) ->
    event.preventDefault()
