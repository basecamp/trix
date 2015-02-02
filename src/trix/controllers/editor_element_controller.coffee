#= require trix/controllers/controller

{triggerEvent} = Trix

class Trix.EditorElementController extends Trix.Controller
  constructor: (@element, @documentElement, @inputElement) ->
    @contentType = @element.getAttribute("content-type") ? "text/html"

  unserializableElementSelector = "[data-trix-serialize=false]"
  unserializableAttributeNames = ["contenteditable", "data-trix-id"]
  serializedAttributesAttribute = "data-trix-serialized-attributes"
  serializedAttributesSelector = "[#{serializedAttributesAttribute}]"

  serializers =
    "application/json": ->
      @document.toSerializableDocument().toJSONString()

    "text/html": ->
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

  deserializers =
    "application/json": (string) ->
      Trix.Document.fromJSONString(string)

    "text/html": (string) ->
      Trix.Document.fromHTML(string)

  save: ->
    if serializer = serializers[@contentType]
      value = serializer.call(this)
      @inputElement.value = value
      @element.setAttribute("value", value)
    else
      throw new Error "unknown content type: '#{@contentType}'"

  load: ->
    if deserializer = deserializers[@contentType]
      @document.replaceDocument(deserializer.call(this, @inputElement.value))
    else
      throw new Error "unknown content type: '#{@contentType}'"

  # Editor controller delegate

  didSetEditor: (editor) ->
    @document = editor.document
    unless @loaded
      @load()
      @loaded = true

  didChangeDocument: (document) ->
    @save()
    triggerEvent("input", onElement: @element)

  shouldAcceptFile: (file) ->
    event = triggerEvent("beforeattach", onElement: @element, attributes: {file})
    not event.defaultPrevented

  didAddAttachment: (attachment) ->
    triggerEvent("attach", onElement: @element, attributes: {attachment})

  didRemoveAttachment: (attachment) ->
    triggerEvent("unattach", onElement: @element, attributes: {attachment})

  didRenderDocument: ->

  didPaste: (paste) ->

  didThrowError: (error, details) ->

  didChangeSelection: ->
    triggerEvent("selectionchange", onElement: @element, bubbles: false)
