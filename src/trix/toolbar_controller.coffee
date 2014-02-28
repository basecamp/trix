#= require trix/dom

class Trix.ToolbarController
  buttonSelector = ".button[data-attribute]"
  dialogSelector = ".dialog[data-attribute]"

  constructor: (@element) ->
    @attributes = {}
    Trix.DOM.on(@element, "click", buttonSelector, @didClickButton)
    Trix.DOM.on(@element, "input", dialogSelector, @didChangeDialog)
    Trix.DOM.on(@element, "blur", dialogSelector, @didBlurDialog, true)

  didClickButton: (event, element) =>
    event.preventDefault()
    attributeName = getButtonAttributeName(element)

    if element = @getDialogForAttributeName(attributeName)
      @showDialog(element, @attributes[attributeName])
    else
      @delegate?.didClickToolbarButtonForAttributeName?(attributeName)

  didChangeDialog: (event, element) =>
    attributeName = getButtonAttributeName(element)
    @delegate?.didUpdateAttribute(attributeName, element.value)

  didBlurDialog: (event, element) =>
    @hideDialog(element)

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

  showDialog: (element, attributeValue) ->
    @delegate?.didShowToolbarDialog()
    element.classList.add("active")
    element.value = attributeValue if attributeValue
    element.select()

  hideDialog: (element) ->
    @delegate?.didHideToolbarDialog()
    element.classList.remove("active")

  getDialogForAttributeName: (attributeName) ->
    @element.querySelector(".dialog[data-attribute=#{attributeName}]")

  getButtonAttributeName = (element) ->
    element.getAttribute("data-attribute")
