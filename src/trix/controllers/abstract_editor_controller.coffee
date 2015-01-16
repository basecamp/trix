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
  serializedAttributesAttribute = "data-trix-serialized-attributes"
  serializedAttributesSelector = "[#{serializedAttributesAttribute}]"

  toSerializedHTML: ->
    element = @documentElement.cloneNode(true)

    # Remove unserializable elements
    for el in element.querySelectorAll(unserializableElementSelector)
      el.parentNode.removeChild(el)

    # Remove unserializable attributes
    for attribute in unserializableAttributeNames
      for el in element.querySelectorAll("[#{attribute}]")
        el.removeAttribute(attribute)

    # Rewrite elements with serialized attribute overrides
    for el in element.querySelectorAll(serializedAttributesSelector) then try
      attributes = JSON.parse(el.getAttribute(serializedAttributesAttribute))
      el.removeAttribute(serializedAttributesAttribute)
      for name, value of attributes
        el.setAttribute(name, value)

    element.innerHTML
