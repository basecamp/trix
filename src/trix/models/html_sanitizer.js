import BasicObject from "trix/core/basic_object"

import { nodeIsAttachmentElement, removeNode, tagName, walkTree } from "trix/core/helpers"

const DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height class".split(" ")
const DEFAULT_FORBIDDEN_PROTOCOLS = "javascript:".split(" ")
const DEFAULT_FORBIDDEN_ELEMENTS = "script iframe form".split(" ")

export default class HTMLSanitizer extends BasicObject {
  static sanitize(html, options) {
    const sanitizer = new this(html, options)
    sanitizer.sanitize()
    return sanitizer
  }

  constructor(html, { allowedAttributes, forbiddenProtocols, forbiddenElements } = {}) {
    super(...arguments)
    this.allowedAttributes = allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES
    this.forbiddenProtocols = forbiddenProtocols || DEFAULT_FORBIDDEN_PROTOCOLS
    this.forbiddenElements = forbiddenElements || DEFAULT_FORBIDDEN_ELEMENTS
    this.body = createBodyElementForHTML(html)
  }

  sanitize() {
    this.sanitizeElements()
    return this.normalizeListElementNesting()
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
