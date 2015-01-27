#= require ./trix_toolbar_element

prototype = Trix.Helpers.extend Object.create(HTMLElement.prototype),
  createdCallback: ->
    loadStylesheet()

    toolbarElement = findOrCreateToolbarElement(this)
    textareaElement = findOrCreateTextareaElement(this)
    documentElement = createDocumentElement(this, textareaElement)

    @editorController = new Trix.EditorController
      toolbarElement: toolbarElement
      textareaElement: textareaElement
      documentElement: documentElement
      autofocus: textareaElement.hasAttribute("autofocus")

stylesheetElement = do ->
  element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.appendChild(document.createTextNode(Trix.CSS))
  element

loadStylesheet = ->
  unless stylesheetElement.parentNode
    document.querySelector("head").appendChild(stylesheetElement)

findOrCreateToolbarElement = (parentElement) ->
  unless element = parentElement.querySelector("trix-toolbar")
    element = document.createElement("trix-toolbar")
    element.innerHTML = TrixToolbarElement.defaultToolbarHTML
    parentElement.insertBefore(element, parentElement.firstChild)
  element

findOrCreateTextareaElement = (parentElement) ->
  unless element = parentElement.querySelector("textarea")
    element = document.createElement("textarea")
    parentElement.insertBefore(element, null)
  element

createDocumentElement = (parentElement, textareaElement) ->
  element = document.createElement("div")
  element.setAttribute("contenteditable", "true")

  if placeholder = textareaElement.getAttribute("placeholder")
    element.setAttribute("data-placeholder", placeholder)

  element.className = textareaElement.className
  element.classList.add("trix-editor")
  element.style.minHeight = textareaElement.offsetHeight + "px"
  disableObjectResizing(element)

  textareaElement.style["display"] = "none"
  textareaElement.parentElement.insertBefore(element, textareaElement)
  element

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

@TrixEditorElement = document.registerElement("trix-editor", {prototype})
