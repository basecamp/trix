import BasicObject from "trix/core/basic_object"

import { escapeAngleBracketsInJSON, nodeIsAttachmentElement, removeNode, tagName, walkTree } from "trix/core/helpers"
import DOMPurify from "dompurify"
import * as config from "trix/config"

const ALLOWED_ATTRIBUTE_PATTERN = /^data-trix-/

// DOMPurify's SAFE_FOR_XML check drops attributes whose values contain markup before it
// honors forceKeepAttr, so allowed attributes are stashed here and restored afterwards.
let stashedAttributes = []

DOMPurify.addHook("uponSanitizeAttribute", function (node, data) {
  if (data.attrName === "data-trix-serialized-attributes") {
    data.keepAttr = false
    return
  }

  if (ALLOWED_ATTRIBUTE_PATTERN.test(data.attrName)) {
    data.forceKeepAttr = true
    stashedAttributes.push([ data.attrName, node.getAttribute(data.attrName) ])
  }
})

DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  stashedAttributes.forEach(([ name, value ]) => {
    if (value !== null && !node.hasAttribute(name)) {
      node.setAttribute(name, value)
    }
  })

  stashedAttributes = []
})

const JSON_ATTRIBUTES = "data-trix-attachment data-trix-attributes".split(" ")
const DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height language class".split(" ")
const DEFAULT_FORBIDDEN_PROTOCOLS = "javascript:".split(" ")
const DEFAULT_FORBIDDEN_ELEMENTS = "script iframe form noscript".split(" ")

export default class HTMLSanitizer extends BasicObject {
  static setHTML(element, html, options) {
    const sanitizedElement = new this(html, options).sanitize()
    const sanitizedHtml = sanitizedElement.getHTML ? sanitizedElement.getHTML() : sanitizedElement.outerHTML
    element.innerHTML = sanitizedHtml
  }

  static sanitize(html, options) {
    const sanitizer = new this(html, options)
    sanitizer.sanitize()
    return sanitizer
  }

  constructor(html, { allowedAttributes, forbiddenProtocols, forbiddenElements, purifyOptions } = {}) {
    super(...arguments)
    this.allowedAttributes = allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES
    this.forbiddenProtocols = forbiddenProtocols || DEFAULT_FORBIDDEN_PROTOCOLS
    this.forbiddenElements = forbiddenElements || DEFAULT_FORBIDDEN_ELEMENTS
    this.purifyOptions = purifyOptions || {}
    this.body = createBodyElementForHTML(html)
  }

  sanitize() {
    this.sanitizeElements()
    this.normalizeListElementNesting()
    const purifyConfig = Object.assign({}, config.dompurify, this.purifyOptions)
    DOMPurify.setConfig(purifyConfig)
    this.body = DOMPurify.sanitize(this.body)

    return this.body
  }

  getHTML() {
    return this.body.innerHTML
  }

  getBody() {
    return this.body
  }

  // Private

  sanitizeElements() {
    const walker = walkTree(this.body)
    const nodesToRemove = []

    while (walker.nextNode()) {
      const node = walker.currentNode
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          if (this.elementIsRemovable(node)) {
            nodesToRemove.push(node)
          } else {
            this.sanitizeElement(node)
          }
          break
        case Node.COMMENT_NODE:
          nodesToRemove.push(node)
          break
      }
    }

    nodesToRemove.forEach((node) => removeNode(node))

    return this.body
  }

  sanitizeElement(element) {
    if (element.hasAttribute("href")) {
      if (this.forbiddenProtocols.includes(element.protocol)) {
        element.removeAttribute("href")
      }
    }

    Array.from(element.attributes).forEach(({ name }) => {
      if (!this.allowedAttributes.includes(name) && name.indexOf("data-trix") !== 0) {
        element.removeAttribute(name)
      }
    })

    // HTML from older Trix versions, server-side renderers and stored content carries the
    // JSON with literal angle brackets. The hooks above put back a data-trix-* attribute that
    // SAFE_FOR_XML drops for containing "</style>" or another raw-text closing sequence, but
    // the restored value still carries it. Escaping the brackets before DOMPurify sees the
    // value leaves it nothing to drop, and JSON.parse reads the same value back. A value that
    // doesn't parse is left alone: HTMLParser ignores it either way, and rewriting it could
    // only turn it into something that parses.
    JSON_ATTRIBUTES.forEach((name) => {
      const value = element.getAttribute(name)
      if (value && parsesAsJSON(value)) {
        element.setAttribute(name, escapeAngleBracketsInJSON(value))
      }
    })

    return element
  }

  normalizeListElementNesting() {
    Array.from(this.body.querySelectorAll("ul,ol")).forEach((listElement) => {
      const previousElement = listElement.previousElementSibling
      if (previousElement) {
        if (tagName(previousElement) === "li") {
          previousElement.appendChild(listElement)
        }
      }
    })

    return this.body
  }

  elementIsRemovable(element) {
    if (element?.nodeType !== Node.ELEMENT_NODE) return
    return this.elementIsForbidden(element) || this.elementIsntSerializable(element)
  }

  elementIsForbidden(element) {
    return this.forbiddenElements.includes(tagName(element))
  }

  elementIsntSerializable(element) {
    return element.getAttribute("data-trix-serialize") === "false" && !nodeIsAttachmentElement(element)
  }
}

const parsesAsJSON = (string) => {
  try {
    JSON.parse(string)
    return true
  } catch (error) {
    return false
  }
}

const createBodyElementForHTML = function(html = "") {
  // Remove everything after </html>
  html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>")
  const doc = document.implementation.createHTMLDocument("")
  doc.documentElement.innerHTML = html

  Array.from(doc.head.querySelectorAll("style")).forEach((element) => {
    doc.body.appendChild(element)
  })

  return doc.body
}
