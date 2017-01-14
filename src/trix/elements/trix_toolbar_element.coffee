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
        className: "button button-#{buttonName} icon"
        textContent: title
        data: do ->
          data = {}
          data.trixAttribute = button.attribute if button.attribute?
          data.trixAction = button.action if button.action?
          data.trixKey = button.key if button.key?
          data

  createDialog = (buttonName) ->
    if button = getButtonConfig(buttonName)
      if button.dialog
        element = makeElement
          tagName: "div"
          className: "dialog dialog-#{buttonName}"
          data: trixAttribute: button.attribute, trixDialog: button.attribute

        innerElement = makeElement(tagName: "div", className: "dialog-#{buttonName}-inner")
        innerElement.appendChild(makeFragment(button.dialog))

        element.appendChild(innerElement)
        element

  createFragment = ->
    fragment = makeFragment()
    dialogsElement = makeElement(tagName: "div", className: "dialogs")

    for row in Trix.config.toolbar.rows
      rowElement = makeElement(tagName: "div", className: "button-row")
      fragment.appendChild(rowElement)

      for group in row
        groupElement = makeElement(tagName: "span", className: "button-group")
        rowElement.appendChild(groupElement)

        for buttonName in group
          if buttonElement = createButton(buttonName)
            groupElement.appendChild(buttonElement)

          if dialogElement = createDialog(buttonName)
            dialogsElement.appendChild(dialogElement)

    fragment.appendChild(dialogsElement)
    fragment

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
