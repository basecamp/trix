{handleEvent, triggerEvent, findClosestElementFromNode} = Trix

class Trix.ToolbarController extends Trix.BasicObject
  actionButtonSelector = "button[data-action]"
  attributeButtonSelector = "button[data-attribute]"
  toolbarButtonSelector = [actionButtonSelector, attributeButtonSelector].join(", ")
  dialogSelector = ".dialog[data-attribute]"
  activeDialogSelector = "#{dialogSelector}.active"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"
  dialogInputSelector = "#{dialogSelector} input[type=text], #{dialogSelector} input[type=url]"

  constructor: (@element) ->
    @attributes = {}
    @actions = {}
    @resetDialogInputs()

    handleEvent "mousedown", onElement: @element, matchingSelector: actionButtonSelector, withCallback: @didClickActionButton
    handleEvent "mousedown", onElement: @element, matchingSelector: attributeButtonSelector, withCallback: @didClickAttributeButton
    handleEvent "click", onElement: @element, matchingSelector: toolbarButtonSelector, preventDefault: true
    handleEvent "click", onElement: @element, matchingSelector: dialogButtonSelector, withCallback: @didClickDialogButton
    handleEvent "keydown", onElement: @element, matchingSelector: dialogInputSelector, withCallback: @didKeyDownDialogInput

  # Event handlers

  didClickActionButton: (event, element) =>
    @delegate?.toolbarDidClickButton()
    event.preventDefault()
    actionName = getActionName(element)

    if @getDialogForAttributeName(actionName)
      @toggleDialog(actionName)
    else
      @delegate?.toolbarDidInvokeAction(actionName)

  didClickAttributeButton: (event, element) =>
    @delegate?.toolbarDidClickButton()
    event.preventDefault()
    attributeName = getAttributeName(element)

    if @getDialogForAttributeName(attributeName)
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
      dialog = @getDialogForAttributeName(attribute)
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

  dialogIsVisible: (attributeName) ->
    if element = @getDialogForAttributeName(attributeName)
      element.classList.contains("active")

  toggleDialog: (attributeName) ->
    if @dialogIsVisible(attributeName)
      @hideDialog()
    else
      @showDialog(attributeName)

  showDialog: (attributeName) ->
    @hideDialog()
    @delegate?.toolbarWillShowDialog()

    element = @getDialogForAttributeName(attributeName)
    element.classList.add("active")

    if input = getInputForDialog(element, attributeName)
      input.removeAttribute("disabled")
      input.value = @attributes[attributeName] ? ""
      input.select()

    @delegate?.toolbarDidShowDialog(element)

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
      @delegate?.toolbarDidHideDialog(element)

  resetDialogInputs: ->
    for input in @element.querySelectorAll(dialogInputSelector)
      input.setAttribute("disabled", "disabled")
      input.classList.remove("validate")

  getDialogForAttributeName: (attributeName) ->
    @element.querySelector(".dialog[data-attribute=#{attributeName}]")

  getInputForDialog = (element, attributeName) ->
    attributeName ?= getAttributeName(element)
    element.querySelector("input[name='#{attributeName}']")

  # General helpers

  getActionName = (element) ->
    element.getAttribute("data-action")

  getAttributeName = (element) ->
    element.getAttribute("data-attribute")
