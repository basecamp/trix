#= require_self
#= require trix/core
#= require_tree ./trix/config
#= require trix/controllers/editor_controller
#= require trix/controllers/degraded_editor_controller

@Trix =
  config:
    useMobileInputMode: ->
      /iPhone|iPad|Android|Windows Phone/.test(navigator.userAgent)

  isSupported: (config = {}) ->
    trixSupport = new BrowserSupport().getTrixSupport()

    switch config.mode ? "full"
      when "full"
        trixSupport.fullEditor
      when "degraded"
        trixSupport.degradedEditor
      else
        false

  install: (config) ->
    if @isSupported(config)
      installer = new Installer config
      installer.run()
      installer.editor

class BrowserSupport
  required:
    "addEventListener" of document and
    "createTreeWalker" of document and
    "getComputedStyle" of window and
    "getSelection"     of window

  caretPosition:
    "caretPositionFromPoint" of document or
    "caretRangeFromPoint"    of document or
    "createTextRange"        of document.createElement("body")

  getTrixSupport: ->
    degradedEditor: @required
    fullEditor: @required and @caretPosition


class Installer
  constructor: (@config = {}) ->
    for key in ["textarea", "toolbar"]
      @config["#{key}Element"] = getElement(@config[key])
      delete @config[key]
    @config.autofocus ?= @config.textareaElement.hasAttribute("autofocus")

  run: ->
    @config.documentElement = @createDocumentElement()
    @createStyleSheet()
    @editor = @createEditor()

  createEditor: ->
    switch @config.mode ? "full"
      when "full"
        new Trix.EditorController @config
      when "degraded"
        new Trix.DegradedEditorController @config

  styleSheetId = "trix-styles"

  createStyleSheet: ->
    if !document.getElementById(styleSheetId) and Trix.CSS
      element = document.createElement("style")
      element.setAttribute("type", "text/css")
      element.setAttribute("id", styleSheetId)
      element.appendChild(document.createTextNode(Trix.CSS))
      document.querySelector("head").appendChild(element)

  documentElementAttributes =
    contenteditable: "true"
    autocorrect: "off"

  createDocumentElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.setAttribute(key, value) for key, value of documentElementAttributes

    if placeholder = textarea.getAttribute("placeholder")
      element.setAttribute("data-placeholder", placeholder)

    element.className = textarea.className
    element.classList.add("trix-editor")

    if @config.className
      for className in @config.className.split(" ")
        element.classList.add(className)

    element.style.minHeight = textarea.offsetHeight + "px"
    textarea.style["display"] = "none"
    textarea.parentElement.insertBefore(element, textarea)

    disableObjectResizing(element)
    element

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
      {handleEvent} = Trix.DOM
      if document.queryCommandSupported?("enableObjectResizing")
        handleEvent "focus", onElement: element, withCallback: disableObjectResizing, inPhase: "capturing"
      handleEvent "mscontrolselect", onElement: element, preventDefault: true
