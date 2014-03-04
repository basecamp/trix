#= require trix/dom

class Trix.ToolbarController
  buttonSelector = ".button[data-attribute]"
  dialogSelector = ".dialog[data-attribute]"
  dialogButtonSelector = "#{dialogSelector} input[data-method]"

  constructor: (@element) ->
    @attributes = {}
    Trix.DOM.on(@element, "click", buttonSelector, @didClickButton)
    Trix.DOM.on(@element, "click", dialogButtonSelector, @didClickDialogButton)

  didClickButton: (event, element) =>
    event.preventDefault()
    attributeName = getButtonAttributeName(element)

    if @getDialogForAttributeName(attributeName)
      @showDialog(attributeName)
    else
      @delegate?.toolbarDidToggleAttribute(attributeName)

  didClickDialogButton: (event, element) =>
    dialogElement = Trix.DOM.closest(element, dialogSelector)
    method = element.getAttribute("data-method")
    @[method].call(this, dialogElement)

  setAttribute: (dialogElement) ->
    attributeName = getButtonAttributeName(dialogElement)
    value = getInputForDialog(dialogElement).value
    @delegate?.toolbarDidUpdateAttribute(attributeName, value)

  removeAttribute: (dialogElement) ->
    getInputForDialog(dialogElement).value = null
    @setAttribute(dialogElement)

  updateAttributes: (attributes) ->
    @attributes = attributes
    @eachButton (element, attributeName) ->
      if attributes[attributeName]
        element.classList.add("active")
      else
        element.classList.remove("active")

  eachButton: (callback) ->
    for element in @element.querySelectorAll(buttonSelector)
      callback(element, getButtonAttributeName(element))

  showDialog: (attributeName) ->
    @delegate?.toolbarWillShowDialog()

    element = @getDialogForAttributeName(attributeName)
    element.classList.add("active")

    input = element.querySelector("input[name='#{attributeName}']")
    input.value = @attributes[attributeName] ? ""
    input.select()

  hideDialogs: ->
    for element in @element.querySelectorAll(dialogSelector)
      element.classList.remove("active")

  getDialogForAttributeName: (attributeName) ->
    @element.querySelector(".dialog[data-attribute=#{attributeName}]")

  getButtonAttributeName = (element) ->
    element.getAttribute("data-attribute")

  getInputForDialog = (element) ->
    attributeName = getButtonAttributeName(element)
    element.querySelector("input[name='#{attributeName}']")
