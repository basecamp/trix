import BasicObject from "trix/core/basic_object"

import { escapeAngleBracketsInJSON, nodeIsAttachmentElement, removeNode, tagName, walkTree } from "trix/core/helpers"
import DOMPurify from "dompurify"
import * as config from "trix/config"

const ALLOWED_ATTRIBUTE_PATTERN = /^data-trix-/

DOMPurify.addHook("uponSanitizeAttribute", function (node, data) {
  if (data.attrName === "data-trix-serialized-attributes") {
    data.keepAttr = false
    return
  }

  // SAFE_FOR_XML drops an attribute whose value carries a raw-text closing sequence before
  // forceKeepAttr is honored. sanitizeElement escapes those brackets in the JSON attachment
  // attributes first, so only a value that isn't JSON is left for SAFE_FOR_XML to remove.
  if (ALLOWED_ATTRIBUTE_PATTERN.test(data.attrName)) {
    data.forceKeepAttr = true
  }
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
    // JSON with literal angle brackets, and SAFE_FOR_XML drops any attribute whose value
    // contains "</style>" or another raw-text closing sequence. Escaping the brackets before
    // DOMPurify sees the value leaves it nothing to drop, and JSON.parse reads the same value
    // back. A value that doesn't parse is left for SAFE_FOR_XML to remove: HTMLParser ignores
    // it either way, and rewriting it could only turn it into something that parses.
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

const CLOSING_HTML_TAG_PATTERN = /<\/html(?=[\t\n\f\r />])/gi

// Windows browsers can paste clipboard bytes after the closing </html> tag, and the HTML
// parser would append them to the body as text.
const removeContentAfterClosingHTMLTag = function(html) {
  const offset = html.search(CLOSING_HTML_TAG_PATTERN) < 0 ? -1 : offsetOfClosingHTMLTag(html)
  return offset < 0 ? html : html.slice(0, offset)
}

// The browser's own tokenizer decides which "</html>" is the closing tag: each one is
// swapped for a marker start tag and the string parsed, and the first marker that comes out
// as an element was a real tag rather than text inside an attribute value, a comment or a
// style element. The marker's name carries a token chosen per call, so no element in the
// input can pass for one, and its offset is an unquoted attribute value, so that wherever
// the marker lands it carries nothing that would change the tokenizer's state there.
const offsetOfClosingHTMLTag = function(html) {
  const marker = `trix-closing-html-tag-${Math.random().toString(36).slice(2)}`
  const doc = document.implementation.createHTMLDocument("")
  doc.documentElement.innerHTML = html.replace(CLOSING_HTML_TAG_PATTERN, (tag, offset) => `<${marker} data-offset=${offset}`)

  const offsets = Array.from(doc.querySelectorAll(marker), (element) => parseInt(element.getAttribute("data-offset"), 10))
  return offsets.length ? offsets.reduce((lowest, offset) => Math.min(lowest, offset)) : -1
}

const createBodyElementForHTML = function(html = "") {
  const doc = document.implementation.createHTMLDocument("")
  doc.documentElement.innerHTML = removeContentAfterClosingHTMLTag(html)

  Array.from(doc.head.querySelectorAll("style")).forEach((element) => {
    doc.body.appendChild(element)
  })

  return doc.body
}
