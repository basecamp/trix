#= require_self
#= require trix/utilities/dom
#= require trix/controllers/editor_controller
#= require trix/controllers/degraded_editor_controller

@Trix =
  ZERO_WIDTH_SPACE: "\u2060"

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

  attributes:
    bold:
      tagName: "strong"
      inheritable: true
      parser: ({style}) ->
        style["fontWeight"] is "bold" or style["fontWeight"] >= 700
    italic:
      tagName: "em"
      inheritable: true
      parser: ({style}) ->
        style["fontStyle"] is "italic"
    href:
      tagName: "a"
      parent: true
      parser: ({element}) ->
        if link = Trix.DOM.closest(element, "a")
          link.getAttribute("href")
    underline:
      style: { "text-decoration": "underline" }
      inheritable: true
    frozen:
      style: { "background-color": "highlight" }
    quote:
      block: true
      tagName: "blockquote"
    code:
      block: true
      tagName: "pre"
      plaintext: true

  config:
    editorCSS: """
      .trix-editor[contenteditable=true]:empty:before {
        content: attr(data-placeholder);
        color: graytext;
      }

      .trix-editor a[contenteditable=false] {
        cursor: text;
      }

      .trix-editor .image-editor,
      .trix-editor .pending-attachment {
        position: relative;
        display: inline-block;
      }

      .trix-editor .image-editor img {
        outline: 1px dashed #333;
      }

      .trix-editor .image-editor .resize-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        border: 1px solid #333;
        background: white;
      }

      .trix-editor .image-editor .resize-handle.se {
        bottom: -4px;
        right: -4px;
        cursor: nwse-resize;
      }

      .trix-editor figure.attachment::selection, figure.attachment *::selection {
        background-color: rgba(0, 0, 0, 0);
      }

      .trix-editor figure.attachment::-moz-selection, figure.attachment *::-moz-selection {
        background-color: rgba(0, 0, 0, 0);
      }
    """

  debug:
    logEditOperations: false


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
    @setConfigElements()
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

  setConfigElements: ->
    for key in "textarea toolbar input".split(" ")
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

  documentElementAttributes =
    contenteditable: "true"
    autocorrect: "off"

  createDocumentElement: ->
    textarea = @config.textareaElement

    element = document.createElement("div")
    element.innerHTML = textarea.value
    element.setAttribute(key, value) for key, value of documentElementAttributes

    if placeholder = textarea.getAttribute("placeholder")
      element.setAttribute("data-placeholder", placeholder)

    element.className = textarea.className
    element.classList.add("trix-editor")
    element.classList.add(@config.className.split(" ")...) if @config.className

    element.style.minHeight = window.getComputedStyle(textarea).height
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
      if document.queryCommandSupported?("enableObjectResizing")
        element.addEventListener("focus", disableObjectResizing, true)
      element.addEventListener("mscontrolselect", cancelEvent, true)

  cancelEvent = (event) ->
    event.preventDefault()
