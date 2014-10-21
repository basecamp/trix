#= require trix/models/text
#= require trix/models/document
#= require trix/utilities/dom
#= require trix/utilities/html_parser

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@documentElement, @toolbarElement, @textareaElement, @inputElement, @delegate} = @config
    @document = @createDocument()

  createDocument: ->
    if @documentElement.textContent.trim()
      Trix.Document.fromHTML(@documentElement.innerHTML)
    else if @inputElement?.value
      Trix.Document.fromJSONString(@inputElement.value)
    else
      new Trix.Document

  saveSerializedDocument: ->
    @textareaElement.value = @serializedHTML()
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @document.toSerializableDocument().toJSONString()

  unserializableElementSelector = "[data-trix-serialize=false]"
  unserializableAttributeNames = ["contenteditable", "data-trix-id"]

  serializedHTML: ->
    element = @documentElement.cloneNode(true)

    for el in element.querySelectorAll(unserializableElementSelector)
      el.parentNode.removeChild(el)

    for attribute in unserializableAttributeNames
      for el in element.querySelectorAll("[#{attribute}]")
        el.removeAttribute(attribute)

    element.innerHTML
