#= require trix/dom

class Trix.ToolbarController
  buttonSelector = ".button[data-attribute]"
  dialogSelector = ".dialog[data-attribute]"

  constructor: (@element) ->
    @attributes = {}
    Trix.DOM.on(@element, "click", buttonSelector, @didClickButton)
    Trix.DOM.on(@element, "submit", dialogSelector, @didSubmitDialog)
    Trix.DOM.on(@element, "reset", dialogSelector, @didResetDialog)

  didClickButton: (event, element) =>
    event.preventDefault()
    attributeName = getButtonAttributeName(element)

    if @getDialogForAttributeName(attributeName)
      @showDialog(attributeName)
    else
      @delegate?.didClickToolbarButtonForAttributeName?(attributeName)

  didSubmitDialog: (event, element) =>
    event.preventDefault()
    attributeName = getButtonAttributeName(element)
    value = element.querySelector("input[name='#{attributeName}']").value
    @delegate?.didUpdateAttribute(attributeName, value)
    @hideDialog(attributeName)

  didResetDialog: (event, element) =>
    event.preventDefault()
    attributeName = getButtonAttributeName(element)
    @delegate?.didUpdateAttribute(attributeName, null)
    @hideDialog(attributeName)

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
    @delegate?.didShowToolbarDialog()

    element = @getDialogForAttributeName(attributeName)
    element.classList.add("active")

    input = element.querySelector("input[name='#{attributeName}']")
    input.value = @attributes[attributeName] ? ""
    input.select()

  hideDialog: (attributeName) ->
    @delegate?.didHideToolbarDialog()
    element = @getDialogForAttributeName(attributeName)
    element.classList.remove("active")

  getDialogForAttributeName: (attributeName) ->
    @element.querySelector(".dialog[data-attribute=#{attributeName}]")

  getButtonAttributeName = (element) ->
    element.getAttribute("data-attribute")
