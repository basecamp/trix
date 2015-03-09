{handleEvent, handleEventOnce} = Trix

Trix.defineElement class extends Trix.Element
  @tagName: "trix-document"

  @defaultCSS: """
    %t {
      min-width: 300px;
      min-height: 150px;
    }

    %t:empty:not(:focus)::before {
      content: attr(placeholder);
      color: graytext;
    }

    %t a[contenteditable=false] {
      cursor: text;
    }

    %t .pending-attachment {
      position: relative;
      display: inline-block;
    }

    %t figure.attachment {
      max-width: 100%;
    }

    %t figure.attachment a.remove {
      position: absolute;
      top: -9px;
      right: -9px;
      z-index: 2;
      display: inline-block;
      padding: 0;
      margin: 0;
      width: 18px;
      height: 18px;
      line-height: 18px;
      font-size: 18px;
      border-radius: 18px;
      vertical-align: middle;
      text-align: center;
      text-decoration: none;
      background-color: white;
      color: rgba(0,0,0,0.8);
    }

    %t figure.attachment a.remove:hover {
      color: red;
    }
  """

  createdCallback: ->
    super
    makeEditable(this)

  attachedCallback: ->
    super
    if @hasAttribute("autofocus") and document.querySelector("[autofocus]") is this
      @focus()

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
