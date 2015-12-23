{makeElement, makeFragment} = Trix

Trix.registerElement "trix-toolbar", do ->
  getButtonConfig = (buttonName) ->
    Trix.config.toolbar.buttons[buttonName]

  getButtonTitle = (buttonName) ->
    Trix.config.lang[buttonName] ? ""

  getButtonGroups = ->
    Trix.config.toolbar.groups

  createButton = (buttonName) ->
    if button = getButtonConfig(buttonName)
      title = getButtonTitle(buttonName)
      makeElement
        tagName: "button"
        attributes: type: "button", title: title
        className: "button button-#{buttonName}"
        textContent: title
        data: do ->
          data = {}
          data.attribute = button.attribute if button.attribute?
          data.action = button.action if button.action?
          data.key = button.key if button.key?
          data

  createDialog = (buttonName) ->
    if button = getButtonConfig(buttonName)
      if button.dialog
        element = makeElement
          tagName: "div"
          className: "dialog dialog-#{buttonName}"
          data: attribute: button.attribute, dialog: button.attribute

        innerElement = makeElement(tagName: "div", className: "dialog-#{buttonName}-inner")
        innerElement.appendChild(makeFragment(button.dialog))

        element.appendChild(innerElement)
        element

  createFragment = ->
    groupsElement = makeElement(tagName: "div", className: "button-groups")
    dialogsElement = makeElement(tagName: "div", className: "dialogs")

    for group in Trix.config.toolbar.groups
      groupElement = makeElement(tagName: "span", className: "button-group")
      groupsElement.appendChild(groupElement)

      for buttonName in group
        if buttonElement = createButton(buttonName)
          groupElement.appendChild(buttonElement)

        if dialogElement = createDialog(buttonName)
          dialogsElement.appendChild(dialogElement)

    makeFragment(groupsElement, dialogsElement)

  defaultCSS: """
    %t .dialog {
      display: none;
    }

    %t .dialog.active {
      display: block;
    }

    %t .dialog input.validate:invalid {
      background-color: #ffdddd;
    }
  """

  createdCallback: ->
    if @innerHTML is ""
      @appendChild(createFragment())
