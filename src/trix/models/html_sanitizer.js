import BasicObject from "trix/core/basic_object"

import { nodeIsAttachmentElement, removeNode, tagName, walkTree } from "trix/core/helpers"
import DOMPurify from "dompurify"
import * as config from "trix/config"

// DOMPurify's SAFE_FOR_XML guard removes any attribute whose value contains an
// XML-unsafe sequence (a comment terminator like `-->`/`--!>`, `]>`, or a raw
// `</style`-style tag close). Trix serializes attachment content — including any
// Rails view-annotation comments such as `<!-- BEGIN app/views/... -->` — inside
// the `data-trix-attachment` data attribute (see basecamp/trix#1213). Under
// SAFE_FOR_XML that attribute value trips this guard, so the whole attribute is
// dropped and the attachment silently disappears on the storage round-trip.
//
// These are data attributes: their values are always entity-escaped on
// serialization and never re-parsed as markup, so keeping them is mXSS-safe.
// This regexp mirrors DOMPurify's own SAFE_FOR_XML attribute-value check.
const XML_UNSAFE_ATTRIBUTE_VALUE =
  /((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/gi

DOMPurify.addHook("uponSanitizeAttribute", function (node, data) {
  if (data.attrName === "data-trix-serialized-attributes") {
    data.keepAttr = false
    return
  }

  const allowedAttributePattern = /^data-trix-/
  if (allowedAttributePattern.test(data.attrName)) {
    // Preserve serialized Trix data attributes (e.g. attachment content with
    // comments) even under SAFE_FOR_XML. We neutralize only the copy DOMPurify
    // inspects for its XML-safety guard; forceKeepAttr then keeps the *original*
    // value verbatim, so the neutralized copy is never written to the DOM.
    data.attrValue = data.attrValue.replace(XML_UNSAFE_ATTRIBUTE_VALUE, "")
    data.forceKeepAttr = true
  }
})

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
