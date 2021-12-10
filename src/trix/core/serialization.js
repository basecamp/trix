/* eslint-disable
    no-empty,
*/
import { removeNode } from "trix/core/helpers"

import DocumentView from "trix/views/document_view"
import Document from "trix/models/document"
import HTMLParser from "trix/models/html_parser"

const unserializableElementSelector = "[data-trix-serialize=false]"
const unserializableAttributeNames = [
  "contenteditable",
  "data-trix-id",
  "data-trix-store-key",
  "data-trix-mutable",
  "data-trix-placeholder",
  "tabindex",
]
const serializedAttributesAttribute = "data-trix-serialized-attributes"
const serializedAttributesSelector = `[${serializedAttributesAttribute}]`

const blockCommentPattern = new RegExp("<!--block-->", "g")

const serializers = {
  "application/json": function(serializable) {
    let document
    if (serializable instanceof Document) {
      document = serializable
    } else if (serializable instanceof HTMLElement) {
      document = HTMLParser.parse(serializable.innerHTML).getDocument()
    } else {
      throw new Error("unserializable object")
    }

    return document.toSerializableDocument().toJSONString()
  },

  "text/html": function(serializable) {
    let element
    if (serializable instanceof Document) {
      element = DocumentView.render(serializable)
    } else if (serializable instanceof HTMLElement) {
      element = serializable.cloneNode(true)
    } else {
      throw new Error("unserializable object")
    }

    // Remove unserializable elements
    Array.from(element.querySelectorAll(unserializableElementSelector)).forEach((el) => {
      removeNode(el)
    })

    // Remove unserializable attributes
    unserializableAttributeNames.forEach((attribute) => {
      Array.from(element.querySelectorAll(`[${attribute}]`)).forEach((el) => {
        el.removeAttribute(attribute)
      })
    })

    // Rewrite elements with serialized attribute overrides
    Array.from(element.querySelectorAll(serializedAttributesSelector)).forEach((el) => {
      try {
        const attributes = JSON.parse(el.getAttribute(serializedAttributesAttribute))
        el.removeAttribute(serializedAttributesAttribute)
        for (const name in attributes) {
          const value = attributes[name]
          el.setAttribute(name, value)
        }
      } catch (error) {}
    })

    return element.innerHTML.replace(blockCommentPattern, "")
  },
}

const deserializers = {
  "application/json": function(string) {
    return Document.fromJSONString(string)
  },

  "text/html": function(string) {
    return HTMLParser.parse(string).getDocument()
  },
}

export const serializeToContentType = function(serializable, contentType) {
  const serializer = serializers[contentType]
  if (serializer) {
    return serializer(serializable)
  } else {
    throw new Error(`unknown content type: ${contentType}`)
  }
}

export const deserializeFromContentType = function(string, contentType) {
  const deserializer = deserializers[contentType]
  if (deserializer) {
    return deserializer(string)
  } else {
    throw new Error(`unknown content type: ${contentType}`)
  }
}
