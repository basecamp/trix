#= require trix/elements/trix_toolbar_element
#= require trix/elements/trix_document_element
#= require trix/controllers/editor_controller
#= require trix/controllers/editor_element_controller

{makeElement, tagName} = Trix

Trix.defineElement class extends Trix.Element
  @tagName: "trix-editor"

  createdCallback: ->
    super
    findOrCreateToolbarElement(this)
    findOrCreateDocumentElement(this)
    findOrCreateInputElement(this)

  attachedCallback: ->
    super
    @setAttribute("content-type", "text/html") unless @getAttribute("content-type")
    @initializeEditorController()

  childAttachedCallback: (element) ->
    super
    @attachedChildren ?= {}
    @attachedChildren[tagName(element)] = element
    @initializeEditorController()

  detachedCallback: ->
    super
    @editorController?.unregisterSelectionManager()
    delete @attachedChildren

  initializeEditorController: ->
    toolbarElement = @attachedChildren?["trix-toolbar"]
    documentElement = @attachedChildren?["trix-document"]
    return unless toolbarElement? and documentElement?

    contentType = @getAttribute("content-type")
    inputElement = findInputElement(this)

    @editorController ?= new Trix.EditorController
      toolbarElement: toolbarElement
      documentElement: documentElement
      document: Trix.deserializeFromContentType(inputElement.value, contentType)
      delegate: new Trix.EditorElementController this, documentElement, inputElement

    @editorController.registerSelectionManager()

  findOrCreateToolbarElement = (parentElement) ->
    unless element = parentElement.querySelector("trix-toolbar")
      element = makeElement("trix-toolbar")
      parentElement.insertBefore(element, parentElement.firstChild)
    element

  findOrCreateDocumentElement = (parentElement) ->
    unless element = parentElement.querySelector("trix-document")
      placeholder = parentElement.getAttribute("placeholder")
      element = makeElement("trix-document", {placeholder})
      if parentElement.hasAttribute("autofocus")
        parentElement.removeAttribute("autofocus")
        element.setAttribute("autofocus", "")
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
