{makeElement} = Trix
{lang} = Trix.config
{buttons, groups} = Trix.config.toolbar

Trix.registerElement "trix-toolbar", do ->
  createButton = (buttonName) ->
    if button = buttons[buttonName]
      makeElement
        tagName: "button"
        attributes: type: "button"
        className: "button button-#{buttonName}"
        title: lang[buttonName]
        textContent: lang[buttonName]
        data: do ->
          data = {}
          data.attribute = button.attribute if button.attribute?
          data.action = button.action if button.action?
          data.key = button.key if button.key?
          data

  createDialog = (buttonName) ->
    if button = buttons[buttonName]
      if button.createDialog
        element = makeElement
          tagName: "div"
          className: "dialog dialog-#{buttonName}"
          data: attribute: button.attribute, dialog: button.attribute

        innerElement = makeElement
          tagName: "div"
          className: "dialog-#{buttonName}-inner"
          html: button.createDialog()

        element.appendChild(innerElement)
        element

  createFragment = ->
    fragment = document.createDocumentFragment()

    groupsElement = makeElement(tagName: "div", className: "button-groups")
    fragment.appendChild(groupsElement)

    dialogsElement = makeElement(tagName: "div", className: "dialogs")
    fragment.appendChild(dialogsElement)

    for group in groups
      groupElement = makeElement(tagName: "span", className: "button-group")
      groupsElement.appendChild(groupElement)

      for buttonName in group
        if buttonElement = createButton(buttonName)
          groupElement.appendChild(buttonElement)

        if dialogElement = createDialog(buttonName)
          dialogsElement.appendChild(dialogElement)

    fragment

  defaultCSS: """
    %t {
      white-space: collapse;
    }

    %t .dialog {
      display: none;
    }

    %t .dialog.active {
      display: block;
    }

    %t .dialog input.validate:invalid {
      background-color: #ffdddd;
    }

    %t[native] {
      display: none;
    }
  """

  createdCallback: ->
    if @innerHTML is ""
      @appendChild(createFragment())
