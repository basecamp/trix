#= require trix/elements/trix_toolbar_element
#= require trix/elements/trix_document_element
#= require trix/controllers/editor_controller
#= require trix/controllers/editor_element_controller

{makeElement, tagName, handleEvent, defer} = Trix

Trix.registerElement "trix-editor",
  # Properties

  composition:
    get: ->
      @editorController?.composition

  value:
    get: ->
      findInputElement(this).value

  # Selection methods

  getClientRectAtPosition: (position) ->
    @editorController?.getClientRectAtPosition(position)

  # Element lifecycle

  attachedCallback: ->
    toolbarElement = findOrCreateToolbarElement(this)
    documentElement = findOrCreateDocumentElement(this)
    inputElement = findOrCreateInputElement(this)

    document = Trix.deserializeFromContentType(@value, "text/html")
    delegate = new Trix.EditorElementController this, documentElement, inputElement

    @editorController = new Trix.EditorController {documentElement, toolbarElement, document, delegate}
    @editorController.registerSelectionManager()

  detachedCallback: ->
    @editorController?.unregisterSelectionManager()

findOrCreateToolbarElement = (parentElement) ->
  unless element = parentElement.querySelector("trix-toolbar")
    element = makeElement("trix-toolbar")
    parentElement.insertBefore(element, parentElement.firstChild)
  element

findOrCreateDocumentElement = (parentElement) ->
  unless element = parentElement.querySelector("trix-document")
    element = makeElement("trix-document")
    if parentElement.hasAttribute("autofocus")
      parentElement.removeAttribute("autofocus")
      element.setAttribute("autofocus", "")
    if placeholder = parentElement.getAttribute("placeholder")
      parentElement.removeAttribute("placeholder")
      element.setAttribute("placeholder", placeholder)
    parentElement.insertBefore(element, null)
  element

findOrCreateInputElement = (parentElement) ->
  unless element = findInputElement(parentElement)
    name = parentElement.getAttribute("name")
    element = makeElement("input", type: "hidden")
    element.name = name if name?
    parentElement.insertBefore(element, null)

  if parentElement.hasAttribute("value")
    element.value = parentElement.getAttribute("value")
    parentElement.removeAttribute("value")

  element

findInputElement = (parentElement) ->
  parentElement.querySelector("input[type=hidden]")
