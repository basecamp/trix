{handleEvent, triggerEvent, findClosestElementFromNode} = Trix

class Trix.ToolbarController extends Trix.BasicObject
  actionButtonSelector = ".button[data-action]"
  attributeButtonSelector = ".button[data-attribute]"
  toolbarButtonSelector = [actionButtonSelector, attributeButtonSelector].join(", ")
  dialogSelector = ".dialog[data-attribute]"
  activeDialogSelector = "#{dialogSelector}.active"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"
  dialogInputSelector = "#{dialogSelector} input[type=text]"

  constructor: (@element) ->
    @attributes = {}

    handleEvent "mousedown", onElement: @element, matchingSelector: actionButtonSelector, withCallback: @didClickActionButton
    handleEvent "mousedown", onElement: @element, matchingSelector: attributeButtonSelector, withCallback: @didClickAttributeButton
    handleEvent "click", onElement: @element, matchingSelector: toolbarButtonSelector, preventDefault: true
    handleEvent "click", onElement: @element, matchingSelector: dialogButtonSelector, withCallback: @didClickDialogButton
    handleEvent "keydown", onElement: @element, matchingSelector: dialogInputSelector, withCallback: @didKeyDownDialogInput

  # Event handlers

  didClickActionButton: (event, element) =>
    event.preventDefault()
    actionName = getActionName(element)
    @delegate?.toolbarDidInvokeAction(actionName)

  didClickAttributeButton: (event, element) =>
    event.preventDefault()
    attributeName = getAttributeName(element)

    if @getDialogForAttributeName(attributeName)
      @toggleDialog(attributeName)
    else
      @delegate?.toolbarDidToggleAttribute(attributeName)

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

  # Action buttons

  updateActions: ->
    @eachActionButton (element, actionName) =>
      if @delegate?.toolbarCanInvokeAction(actionName)
        element.removeAttribute("disabled")
      else
        element.setAttribute("disabled", "disabled")

  eachActionButton: (callback) ->
    for element in @element.querySelectorAll(actionButtonSelector)
      callback(element, getActionName(element))

  # Attribute buttons

  updateAttributes: (attributes) ->
    @attributes = attributes
    @eachAttributeButton (element, attributeName) ->
      if attributes[attributeName]
        element.classList.add("active")
      else
        element.classList.remove("active")

  eachAttributeButton: (callback) ->
    for element in @element.querySelectorAll(attributeButtonSelector)
      callback(element, getAttributeName(element))

  applyKeyboardCommand: (keys) ->
    keyString = JSON.stringify(keys.sort())
    for button in @element.querySelectorAll(".button[data-key]")
      buttonKeys = button.getAttribute("data-key").split("+")
      buttonKeyString = JSON.stringify(buttonKeys.sort())
      if buttonKeyString is keyString
        triggerEvent("mousedown", onElement: button)
        return true
    false

  # Dialogs

  toggleDialog: (attributeName) ->
    element = @getDialogForAttributeName(attributeName)
    if element.classList.contains("active")
      @hideDialog()
    else
      @showDialog(attributeName)

  showDialog: (attributeName) ->
    @hideDialog()

    element = @getDialogForAttributeName(attributeName)
    input = getInputForDialog(element, attributeName)

    @delegate?.toolbarWillShowDialog(input?)

    element.classList.add("active")
    input?.value = @attributes[attributeName] ? ""
    input?.select()

  setAttribute: (dialogElement) ->
    attributeName = getAttributeName(dialogElement)
    value = getInputForDialog(dialogElement, attributeName).value
    @delegate?.toolbarDidUpdateAttribute(attributeName, value)
    @hideDialog()

  removeAttribute: (dialogElement) ->
    attributeName = getAttributeName(dialogElement)
    @delegate?.toolbarDidRemoveAttribute(attributeName)
    @hideDialog()

  hideDialog: ->
    @element.querySelector(activeDialogSelector)?.classList.remove("active")
    @delegate?.toolbarDidHideDialog()

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
