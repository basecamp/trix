{handleEvent, triggerEvent, findClosestElementFromNode} = Trix

class Trix.ToolbarController extends Trix.BasicObject
  actionButtonSelector = "button[data-action]"
  attributeButtonSelector = "button[data-attribute]"
  toolbarButtonSelector = [actionButtonSelector, attributeButtonSelector].join(", ")
  dialogSelector = ".dialog[data-dialog]"
  activeDialogSelector = "#{dialogSelector}.active"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"
  dialogInputSelector = "#{dialogSelector} input[type=text], #{dialogSelector} input[type=url]"
  fileSelector = "input[type=file]"

  constructor: (@element) ->
    @attributes = {}
    @actions = {}
    @resetDialogInputs()

    handleEvent "mousedown", onElement: @element, matchingSelector: actionButtonSelector, withCallback: @didClickActionButton
    handleEvent "mousedown", onElement: @element, matchingSelector: attributeButtonSelector, withCallback: @didClickAttributeButton
    handleEvent "click", onElement: @element, matchingSelector: toolbarButtonSelector, preventDefault: true
    handleEvent "click", onElement: @element, matchingSelector: dialogButtonSelector, withCallback: @didClickDialogButton
    handleEvent "keydown", onElement: @element, matchingSelector: dialogInputSelector, withCallback: @didKeyDownDialogInput
    handleEvent "change", onElement: @element, matchingSelector: fileSelector, withCallback: @didFileChanged

  # Event handlers

  didClickActionButton: (event, element) =>
    @delegate?.toolbarDidClickButton()
    event.preventDefault()
    actionName = getActionName(element)

    if actionName is "image"
      triggerEvent 'click', onElement: @element.querySelector(fileSelector)
    else if @getDialog(actionName)
      @toggleDialog(actionName)
    else
      @delegate?.toolbarDidInvokeAction(actionName)

  didFileChanged: (event, element) =>
    if element.files[0]?
      @delegate?.editor.insertFile(element.files[0])
      element.value = ''

  didClickAttributeButton: (event, element) =>
    @delegate?.toolbarDidClickButton()
    event.preventDefault()
    attributeName = getAttributeName(element)

    if @getDialog(attributeName)
      @toggleDialog(attributeName)
    else
      @delegate?.toolbarDidToggleAttribute(attributeName)

    @refreshAttributeButtons()

  didClickDialogButton: (event, element) =>
    dialogElement = findClosestElementFromNode(element, matchingSelector: dialogSelector)
    method = element.getAttribute("data-method")
    @[method].call(this, dialogElement)

  didKeyDownDialogInput: (event, element) =>
    if event.keyCode is 13 # Enter key
      event.preventDefault()
      attribute = element.getAttribute("name")
      dialog = @getDialog(attribute)
      @setAttribute(dialog)
    if event.keyCode is 27 # Escape key
      event.preventDefault()
      @hideDialog()

  # Action buttons

  updateActions: (@actions) ->
    @refreshActionButtons()

  refreshActionButtons: ->
    @eachActionButton (element, actionName) =>
      element.disabled = @actions[actionName] is false

  eachActionButton: (callback) ->
    for element in @element.querySelectorAll(actionButtonSelector)
      callback(element, getActionName(element))

  # Attribute buttons

  updateAttributes: (@attributes) ->
    @refreshAttributeButtons()

  refreshAttributeButtons: ->
    @eachAttributeButton (element, attributeName) =>
      if @attributes[attributeName] or @dialogIsVisible(attributeName)
        element.classList.add("active")
      else
        element.classList.remove("active")

  eachAttributeButton: (callback) ->
    for element in @element.querySelectorAll(attributeButtonSelector)
      callback(element, getAttributeName(element))

  applyKeyboardCommand: (keys) ->
    keyString = JSON.stringify(keys.sort())
    for button in @element.querySelectorAll("[data-key]")
      buttonKeys = button.getAttribute("data-key").split("+")
      buttonKeyString = JSON.stringify(buttonKeys.sort())
      if buttonKeyString is keyString
        triggerEvent("mousedown", onElement: button)
        return true
    false

  # Dialogs

  dialogIsVisible: (dialogName) ->
    if element = @getDialog(dialogName)
      element.classList.contains("active")

  toggleDialog: (dialogName) ->
    if @dialogIsVisible(dialogName)
      @hideDialog()
    else
      @showDialog(dialogName)

  showDialog: (dialogName) ->
    @hideDialog()
    @delegate?.toolbarWillShowDialog()

    element = @getDialog(dialogName)
    element.classList.add("active")

    if attributeName = getAttributeName(element)
      if input = getInputForDialog(element, dialogName)
        input.removeAttribute("disabled")
        input.value = @attributes[attributeName] ? ""
        input.select()

    @delegate?.toolbarDidShowDialog(dialogName)

  setAttribute: (dialogElement) ->
    attributeName = getAttributeName(dialogElement)
    input = getInputForDialog(dialogElement, attributeName)
    if input.willValidate and not input.checkValidity()
      input.classList.add("validate")
      input.focus()
    else
      @delegate?.toolbarDidUpdateAttribute(attributeName, input.value)
      @hideDialog()

  removeAttribute: (dialogElement) ->
    attributeName = getAttributeName(dialogElement)
    @delegate?.toolbarDidRemoveAttribute(attributeName)
    @hideDialog()

  hideDialog: ->
    if element = @element.querySelector(activeDialogSelector)
      element.classList.remove("active")
      @resetDialogInputs()
      @delegate?.toolbarDidHideDialog(getDialogName(element))

  resetDialogInputs: ->
    for input in @element.querySelectorAll(dialogInputSelector)
      input.setAttribute("disabled", "disabled")
      input.classList.remove("validate")

  getDialog: (dialogName) ->
    @element.querySelector(".dialog[data-dialog=#{dialogName}]")

  getInputForDialog = (element, attributeName) ->
    attributeName ?= getAttributeName(element)
    element.querySelector("input[name='#{attributeName}']")

  # General helpers

  getActionName = (element) ->
    element.getAttribute("data-action")

  getAttributeName = (element) ->
    element.getAttribute("data-attribute")

  getDialogName = (element) ->
    element.getAttribute("data-dialog")
