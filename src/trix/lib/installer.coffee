#= require trix/controllers/editor_controller
#= require trix/controllers/simple_editor_controller

class Trix.Installer
  simpleSupport =
    "addEventListener" of document and
    "createTreeWalker" of document and
    "getComputedStyle" of window and
    "getSelection"     of window

  fullSupport = simpleSupport and
    "MutationObserver" of window

  @supportedModes = []
  @supportedModes.push("full") if fullSupport
  @supportedModes.push("simple") if simpleSupport

  constructor: (@config = {}) ->
    @config.mode ?= @constructor.supportedModes[0]

  modeIsSupported: ->
    @config.mode in @constructor.supportedModes

  createEditor: ->
    if @modeIsSupported()
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

  textElementAttributes =
    contenteditable: "true"
    autocorrect: "off"

  createTextElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.innerHTML = textarea.value
    element.setAttribute(key, value) for key, value of textElementAttributes

    if placeholder = textarea.getAttribute("placeholder")
      element.setAttribute("data-placeholder", placeholder)

    classNames = (@config.className?.split(" ") ? []).concat("trix-editor")
    element.classList.add(name) for name in classNames

    visiblyReplaceTextAreaWithElement(textarea, element)
    disableObjectResizing(element)
    element

  visiblyReplaceTextAreaWithElement = (textarea, element) ->
    copyTextAreaStylesToElement(textarea, element)
    textarea.style["display"] = "none"
    textarea.parentElement.insertBefore(element, textarea)

  textareaStylesToCopy = "width position top left right bottom zIndex color".split(" ")
  textareaStylePatternToCopy = /(border|outline|padding|margin|background)[A-Z]+/

  copyTextAreaStylesToElement = (textarea, element) ->
    textareaStyle = window.getComputedStyle(textarea)

    for style in textareaStylesToCopy
      element.style[style] = textareaStyle[style]

    for key, value of textareaStyle when value and textareaStylePatternToCopy.test(key)
      element.style[key] = value

    element.style["minHeight"] = textareaStyle["height"]

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
