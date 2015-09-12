{handleEvent, handleEventOnce, defer} = Trix

Trix.registerElement "trix-document",
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
  """

  createdCallback: ->
    makeEditable(this)

  attachedCallback: ->
    defer => autofocus(this)
    @setAttribute("initialized", "")

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
