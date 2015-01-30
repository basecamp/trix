{handleEvent} = Trix

Trix.defineElement "trix-document",
  createdCallback: ->
    loadStylesheet()
    setContentEditable(this)
    disableObjectResizing(this)

stylesheetElement = do ->
  element = document.createElement("style")
  element.setAttribute("type", "text/css")
  element.appendChild(document.createTextNode(Trix.CSS))
  element

loadStylesheet = ->
  unless stylesheetElement.parentNode
    head = document.querySelector("head")
    head.insertBefore(stylesheetElement, head.firstChild)

setContentEditable = (element) ->
  unless element.hasAttribute("contenteditable")
    element.setAttribute("contenteditable", "")

disableObjectResizing = (element) ->
  if element instanceof FocusEvent
    event = element
    document.execCommand("enableObjectResizing", false, false)
    event.target.removeEventListener("focus", disableObjectResizing)
  else
    if document.queryCommandSupported?("enableObjectResizing")
      handleEvent "focus", onElement: element, withCallback: disableObjectResizing, inPhase: "capturing"
    handleEvent "mscontrolselect", onElement: element, preventDefault: true
