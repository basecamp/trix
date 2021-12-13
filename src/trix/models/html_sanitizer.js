/* eslint-disable
    no-cond-assign,
    no-undef,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import BasicObject from "trix/core/basic_object"

import { nodeIsAttachmentElement, removeNode, tagName, walkTree } from "trix/core/helpers"

const DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height class".split(" ")
const DEFAULT_FORBIDDEN_PROTOCOLS = "javascript:".split(" ")
const DEFAULT_FORBIDDEN_ELEMENTS = "script iframe".split(" ")

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

    Array.from(nodesToRemove).forEach((node) => {
      removeNode(node)
    })

    return this.body
  }

  sanitizeElement(element) {
    if (element.hasAttribute("href")) {
      if (Array.from(this.forbiddenProtocols).includes(element.protocol)) {
        element.removeAttribute("href")
      }
    }

    [ ...Array.from(element.attributes) ].forEach(({ name }) => {
      if (!Array.from(this.allowedAttributes).includes(name) && name.indexOf("data-trix") !== 0) {
        element.removeAttribute(name)
      }
    })

    return element
  }

  normalizeListElementNesting() {
    [ ...Array.from(this.body.querySelectorAll("ul,ol")) ].forEach((listElement) => {
      let previousElement
      if (previousElement = listElement.previousElementSibling) {
        if (tagName(previousElement) === "li") {
          previousElement.appendChild(listElement)
        }
      }
    })

    return this.body
  }

  elementIsRemovable(element) {
    if (element?.nodeType !== Node.ELEMENT_NODE) {
      return
    }
    return this.elementIsForbidden(element) || this.elementIsntSerializable(element)
  }

  elementIsForbidden(element) {
    let needle
    return needle = tagName(element), Array.from(this.forbiddenElements).includes(needle)
  }

  elementIsntSerializable(element) {
    return element.getAttribute("data-trix-serialize") === "false" && !nodeIsAttachmentElement(element)
  }
}

var createBodyElementForHTML = function(html = "") {
  // Remove everything after </html>
  html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>")
  const doc = document.implementation.createHTMLDocument("")
  doc.documentElement.innerHTML = html

  Array.from(doc.head.querySelectorAll("style")).forEach((element) => {
    doc.body.appendChild(element)
  })

  return doc.body
}
