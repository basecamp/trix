{handleEvent} = Trix.DOM

class Trix.ToolbarController
  actionButtonSelector = ".button[data-action]"
  attributeButtonSelector = ".button[data-attribute]"
  dialogSelector = ".dialog[data-attribute]"
  activeDialogSelector = "#{dialogSelector}.active"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"

  constructor: (@element) ->
    @attributes = {}

    handleEvent "click", onElement: @element, matchingSelector: actionButtonSelector, withCallback: @didClickActionButton
    handleEvent "click", onElement: @element, matchingSelector: attributeButtonSelector, withCallback: @didClickAttributeButton
    handleEvent "click", onElement: @element, matchingSelector: dialogButtonSelector, withCallback: @didClickDialogButton

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
    dialogElement = Trix.DOM.closest(element, dialogSelector)
    method = element.getAttribute("data-method")
    @[method].call(this, dialogElement)

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

  removeAttribute: (dialogElement) ->
    getInputForDialog(dialogElement).value = null
    @setAttribute(dialogElement)

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
