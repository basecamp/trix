#= require trix/models/document

{triggerEvent} = Trix.DOM

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@documentElement, @toolbarElement, @textareaElement, @delegate} = @config
    @serializationFormat = @config.format?.toLowerCase() ? "html"
    @document = @createDocument()

  createDocument: ->
    input = @textareaElement.value
    if input.trim()
      switch @serializationFormat
        when "html" then Trix.Document.fromHTML(input)
        when "json" then Trix.Document.fromJSONString(input)
    else
      new Trix.Document

  saveSerializedDocument: ->
    @textareaElement.value = switch @serializationFormat
      when "html" then @toSerializedHTML()
      when "json" then @document.toSerializableDocument().toJSONString()
    triggerEvent "input", onElement: @textareaElement

  unserializableElementSelector = "[data-trix-serialize=false]"
  unserializableAttributeNames = ["contenteditable", "data-trix-id"]

  toSerializedHTML: ->
    element = @documentElement.cloneNode(true)

    for el in element.querySelectorAll(unserializableElementSelector)
      el.parentNode.removeChild(el)

    for attribute in unserializableAttributeNames
      for el in element.querySelectorAll("[#{attribute}]")
        el.removeAttribute(attribute)

    element.innerHTML
