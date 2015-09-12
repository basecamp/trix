#= require trix/elements/trix_toolbar_element
#= require trix/elements/trix_document_element
#= require trix/elements/trix_input_element
#= require trix/controllers/editor_controller
#= require trix/controllers/editor_element_controller

{makeElement, tagName} = Trix

Trix.registerElement "trix-editor",
  createdCallback: ->
    findOrCreateInputElement(this)
    findOrCreateToolbarElement(this)
    findOrCreateDocumentElement(this)

  attachedCallback: ->
    initialize = =>
      toolbarElement = @querySelector("trix-toolbar[initialized]")
      documentElement = @querySelector("trix-document[initialized]")

      if toolbarElement? and documentElement?
        @initializeEditorController(toolbarElement, documentElement)
        true

    requestAnimationFrame(initialize) unless initialize()

  detachedCallback: ->
    @editorController?.unregisterSelectionManager()

  initializeEditorController: (toolbarElement, documentElement) ->
    inputElement = findInputElement(this)

    @editorController ?= new Trix.EditorController
      toolbarController: toolbarElement.toolbarController
      documentElement: documentElement
      document: Trix.deserializeFromContentType(inputElement.value, "text/html")
      delegate: new Trix.EditorElementController this, documentElement, inputElement

    @editorController.registerSelectionManager()

    @setAttribute("document", @editorController.document.id)

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
    value = parentElement.getAttribute("value")
    element = makeElement("input", type: "hidden")
    element.name = name if name?
    element.value = value if value?
    parentElement.insertBefore(element, null)
  element

findInputElement = (parentElement) ->
  parentElement.querySelector("input[type=hidden]")
