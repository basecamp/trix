#= require trix/dom

class Trix.ToolbarController
  buttonSelector = ".button[data-attribute]"
  dialogSelector = ".dialog[data-attribute]"
  activeDialogSelector = "#{dialogSelector}.active"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"

  constructor: (@element) ->
    @attributes = {}
    Trix.DOM.on(@element, "click", buttonSelector, @didClickButton)
    Trix.DOM.on(@element, "click", dialogButtonSelector, @didClickDialogButton)

  # Event handlers

  didClickButton: (event, element) =>
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

  # Buttons

  updateAttributes: (attributes) ->
    @attributes = attributes
    @eachButton (element, attributeName) ->
      if attributes[attributeName]
        element.classList.add("active")
      else
        element.classList.remove("active")

  eachButton: (callback) ->
    for element in @element.querySelectorAll(buttonSelector)
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

  getAttributeName = (element) ->
    element.getAttribute("data-attribute")
