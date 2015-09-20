#= require trix/elements/trix_toolbar_element
#= require trix/elements/trix_document_element
#= require trix/controllers/editor_controller
#= require trix/controllers/editor_element_controller

{makeElement, tagName, handleEvent, defer} = Trix

requiredChildren = ["trix-document", "trix-toolbar"]

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

  createdCallback: ->
    @attachedChildren = {}

    handleEvent "trix-element-attached", onElement: this, withCallback: (event) =>
      event.stopPropagation()
      @attachedChildren[tagName(event.target)] = event.target

    findOrCreateInputElement(this)
    findOrCreateToolbarElement(this)
    findOrCreateDocumentElement(this)

  attachedCallback: ->
    @attachedChildrenReady =>
      @initializeEditorController()

  detachedCallback: ->
    @editorController?.unregisterSelectionManager()

  requiredChildrenAttached: ->
    return false for child in requiredChildren when not @attachedChildren[child]
    true

  attachedChildrenReady: (callback) ->
    if @requiredChildrenAttached()
      callback()
    else
      handleEvent "trix-element-attached", onElement: this, withCallback: =>
        @attachedChildrenReady(callback)

  initializeEditorController: ->
    documentElement = @attachedChildren["trix-document"]
    toolbarElement = @attachedChildren["trix-toolbar"]
    inputElement = findInputElement(this)

    @editorController ?= new Trix.EditorController
      toolbarController: toolbarElement.toolbarController
      documentElement: documentElement
      document: Trix.deserializeFromContentType(inputElement.value, "text/html")
      delegate: new Trix.EditorElementController this, documentElement, inputElement

    @editorController.registerSelectionManager()


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
