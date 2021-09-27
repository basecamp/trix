import { removeNode } from "trix/core/helpers"

import Trix from "trix/global"
import DocumentView from "trix/views/document_view"
import Document from "trix/models/document"
import HTMLParser from "trix/models/html_parser"

unserializableElementSelector = "[data-trix-serialize=false]"
unserializableAttributeNames = ["contenteditable", "data-trix-id", "data-trix-store-key", "data-trix-mutable", "data-trix-placeholder", "tabindex"]
serializedAttributesAttribute = "data-trix-serialized-attributes"
serializedAttributesSelector = "[#{serializedAttributesAttribute}]"

blockCommentPattern = new RegExp("<!--block-->", "g")

serializers =
  "application/json": (serializable) ->
    if serializable instanceof Document
      document = serializable
    else if serializable instanceof HTMLElement
      document = HTMLParser.parse(serializable.innerHTML).getDocument()
    else
      throw new Error "unserializable object"

    document.toSerializableDocument().toJSONString()

  "text/html": (serializable) ->
    if serializable instanceof Document
      element = DocumentView.render(serializable)
    else if serializable instanceof HTMLElement
      element = serializable.cloneNode(true)
    else
      throw new Error "unserializable object"

    # Remove unserializable elements
    for el in element.querySelectorAll(unserializableElementSelector)
      removeNode(el)

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

    element.innerHTML.replace(blockCommentPattern, "")

deserializers =
  "application/json": (string) ->
    Document.fromJSONString(string)

  "text/html": (string) ->
    HTMLParser.parse(string).getDocument()

export serializeToContentType = (serializable, contentType) ->
  if serializer = serializers[contentType]
    serializer(serializable)
  else
    throw new Error "unknown content type: #{contentType}"

export deserializeFromContentType = (string, contentType) ->
  if deserializer = deserializers[contentType]
    deserializer(string)
  else
    throw new Error "unknown content type: #{contentType}"
