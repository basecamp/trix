#= require trix/elements/trix_toolbar_element
#= require trix/controllers/editor_controller
#= require trix/controllers/editor_element_controller

{makeElement, handleEvent, handleEventOnce, defer} = Trix
{classNames} = Trix.config.css

Trix.registerElement "trix-editor",
  defaultCSS: """
    %t:empty:not(:focus)::before {
      content: attr(placeholder);
      color: graytext;
    }

    %t a[contenteditable=false] {
      cursor: text;
    }

    %t img {
      max-width: 100%;
    }

    %t .#{classNames.attachment.captionEditor} {
      resize: none;
    }

    %t .#{classNames.attachment.captionEditor}.trix-autoresize-clone {
      position: absolute;
      left: -9999px;
      max-height: 0px;
    }
  """

  # Properties

  composition:
    get: ->
      @editorController?.composition

  value:
    get: ->
      @inputElement?.value

  # Selection methods

  getClientRectAtPosition: (position) ->
    @editorController?.getClientRectAtPosition(position)

  # Element lifecycle

  createdCallback: ->
    makeEditable(this)

  attachedCallback: ->
    autofocus(this)

    @toolbarElement = findOrCreateToolbarElement(this)
    @inputElement = findOrCreateInputElement(this)
    editorElement = this

    document = Trix.deserializeFromContentType(@value, "text/html")
    delegate = new Trix.EditorElementController this, editorElement, @inputElement

    @editorController = new Trix.EditorController {editorElement, @toolbarElement, document, delegate}
    @editorController.registerSelectionManager()

  detachedCallback: ->
    @editorController?.unregisterSelectionManager()

findOrCreateToolbarElement = (editorElement) ->
  {previousElementSibling} = editorElement
  if Trix.tagName(previousElementSibling) is "trix-toolbar"
    previousElementSibling
  else
    element = makeElement("trix-toolbar")
    editorElement.parentElement.insertBefore(element, editorElement)
    element

findOrCreateInputElement = (editorElement) ->
  {nextElementSibling} = editorElement
  if nextElementSibling?.dataset?.trixInput
    nextElementSibling
  else
    element = makeElement("input", type: "hidden", "data-trix-input": "")
    element.name = editorElement.getAttribute("name")
    element.value = editorElement.getAttribute("value")
    editorElement.parentElement.insertBefore(element, nextElementSibling)
    element

autofocus = (element) ->
  unless document.querySelector(":focus")
    if element.hasAttribute("autofocus") and document.querySelector("[autofocus]") is element
      element.focus()

makeEditable = (element) ->
  return if element.hasAttribute("contenteditable")
  element.setAttribute("contenteditable", "")
  handleEventOnce("focus", onElement: element, withCallback: -> configureContentEditable(element))

configureContentEditable = (element) ->
  disableObjectResizing(element)
  setDefaultParagraphSeparator(element)

disableObjectResizing = (element) ->
  if document.queryCommandSupported?("enableObjectResizing")
    document.execCommand("enableObjectResizing", false, false)
    handleEvent("mscontrolselect", onElement: element, preventDefault: true)

setDefaultParagraphSeparator = (element) ->
  if document.queryCommandSupported?("DefaultParagraphSeparator")
    {tagName} = Trix.config.blockAttributes.default
    if tagName in ["div", "p"]
      document.execCommand("DefaultParagraphSeparator", false, tagName)
