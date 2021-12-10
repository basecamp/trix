/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import BasicObject from "trix/core/basic_object";

import { tagName, removeNode, walkTree, nodeIsAttachmentElement } from "trix/core/helpers";

const DEFAULT_ALLOWED_ATTRIBUTES = "style href src width height class".split(" ");
const DEFAULT_FORBIDDEN_PROTOCOLS = "javascript:".split(" ");
const DEFAULT_FORBIDDEN_ELEMENTS = "script iframe".split(" ");

export default class HTMLSanitizer extends BasicObject {
  static sanitize(html, options) {
    const sanitizer = new (this)(html, options);
    sanitizer.sanitize();
    return sanitizer;
  }

  constructor(html, { allowedAttributes, forbiddenProtocols, forbiddenElements } = {}) {
    super(...arguments);
    this.allowedAttributes  = allowedAttributes  || DEFAULT_ALLOWED_ATTRIBUTES;
    this.forbiddenProtocols = forbiddenProtocols || DEFAULT_FORBIDDEN_PROTOCOLS;
    this.forbiddenElements  = forbiddenElements  || DEFAULT_FORBIDDEN_ELEMENTS;
    this.body = createBodyElementForHTML(html);
  }

  sanitize() {
    this.sanitizeElements();
    return this.normalizeListElementNesting();
  }

  getHTML() {
    return this.body.innerHTML;
  }

  getBody() {
    return this.body;
  }

  // Private

  sanitizeElements() {
    let node;
    const walker = walkTree(this.body);
    const nodesToRemove = [];

    while (walker.nextNode()) {
      node = walker.currentNode;
      switch (node.nodeType) {
        case Node.ELEMENT_NODE:
          if (this.elementIsRemovable(node)) {
            nodesToRemove.push(node);
          } else {
            this.sanitizeElement(node);
          }
          break;
        case Node.COMMENT_NODE:
          nodesToRemove.push(node);
          break;
      }
    }

    for (node of Array.from(nodesToRemove)) {
      removeNode(node);
    }
    return this.body;
  }

  sanitizeElement(element) {
    if (element.hasAttribute("href")) {
      if (Array.from(this.forbiddenProtocols).includes(element.protocol)) {
        element.removeAttribute("href");
      }
    }

    for (let {name} of [...Array.from(element.attributes)]) {
      if (!Array.from(this.allowedAttributes).includes(name) && (name.indexOf("data-trix") !== 0)) {
        element.removeAttribute(name);
      }
    }

    return element;
  }

  normalizeListElementNesting() {
    for (let listElement of [...Array.from(this.body.querySelectorAll("ul,ol"))]) {
      var previousElement;
      if (previousElement = listElement.previousElementSibling) {
        if (tagName(previousElement) === "li") {
          previousElement.appendChild(listElement);
        }
      }
    }
    return this.body;
  }

  elementIsRemovable(element) {
    if (element?.nodeType !== Node.ELEMENT_NODE) { return; }
    return this.elementIsForbidden(element) || this.elementIsntSerializable(element);
  }

  elementIsForbidden(element) {
    let needle;
    return (needle = tagName(element), Array.from(this.forbiddenElements).includes(needle));
  }

  elementIsntSerializable(element) {
    return (element.getAttribute("data-trix-serialize") === "false") && !nodeIsAttachmentElement(element);
  }
}

var createBodyElementForHTML = function(html = "") {
  // Remove everything after </html>
  html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>");
  const doc = document.implementation.createHTMLDocument("");
  doc.documentElement.innerHTML = html;
  for (let element of Array.from(doc.head.querySelectorAll("style"))) {
    doc.body.appendChild(element);
  }
  return doc.body;
};
