/* eslint-disable
    no-case-declarations,
    no-irregular-whitespace,
*/
import * as config from "trix/config"
import BasicObject from "trix/core/basic_object"
import Document from "trix/models/document"
import HTMLSanitizer from "trix/models/html_sanitizer"

import {
  arraysAreEqual,
  breakableWhitespacePattern,
  elementContainsNode,
  findClosestElementFromNode,
  getBlockTagNames,
  makeElement,
  nodeIsAttachmentElement,
  normalizeSpaces,
  removeNode,
  squishBreakableWhitespace,
  tagName,
  walkTree,
} from "trix/core/helpers"

const pieceForString = (string, attributes = {}) => {
  const type = "string"
  string = normalizeSpaces(string)
  return { string, attributes, type }
}

const pieceForAttachment = (attachment, attributes = {}) => {
  const type = "attachment"
  return { attachment, attributes, type }
}

const blockForAttributes = (attributes = {}) => {
  const text = []
  return { text, attributes }
}

const parseTrixDataAttribute = (element, name) => {
  try {
    return JSON.parse(element.getAttribute(`data-trix-${name}`))
  } catch (error) {
    return {}
  }
}

const getImageDimensions = (element) => {
  const width = element.getAttribute("width")
  const height = element.getAttribute("height")
  const dimensions = {}
  if (width) {
    dimensions.width = parseInt(width, 10)
  }
  if (height) {
    dimensions.height = parseInt(height, 10)
  }
  return dimensions
}

export default class HTMLParser extends BasicObject {
  static parse(html, options) {
    const parser = new this(html, options)
    parser.parse()
    return parser
  }

  constructor(html, { referenceElement } = {}) {
    super(...arguments)
    this.html = html
    this.referenceElement = referenceElement
    this.blocks = []
    this.blockElements = []
    this.processedElements = []
  }

  getDocument() {
    return Document.fromJSON(this.blocks)
  }

  // HTML parsing

  parse() {
    try {
      this.createHiddenContainer()
      const html = HTMLSanitizer.sanitize(this.html).getHTML()
      this.containerElement.innerHTML = html
      const walker = walkTree(this.containerElement, { usingFilter: nodeFilter })
      while (walker.nextNode()) {
        this.processNode(walker.currentNode)
      }
      return this.translateBlockElementMarginsToNewlines()
    } finally {
      this.removeHiddenContainer()
    }
  }

  createHiddenContainer() {
    if (this.referenceElement) {
      this.containerElement = this.referenceElement.cloneNode(false)
      this.containerElement.removeAttribute("id")
      this.containerElement.setAttribute("data-trix-internal", "")
      this.containerElement.style.display = "none"
      return this.referenceElement.parentNode.insertBefore(this.containerElement, this.referenceElement.nextSibling)
    } else {
      this.containerElement = makeElement({ tagName: "div", style: { display: "none" } })
      return document.body.appendChild(this.containerElement)
    }
  }

  removeHiddenContainer() {
    return removeNode(this.containerElement)
  }

  processNode(node) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        if (!this.isInsignificantTextNode(node)) {
          this.appendBlockForTextNode(node)
          return this.processTextNode(node)
        }
        break
      case Node.ELEMENT_NODE:
        this.appendBlockForElement(node)
        return this.processElement(node)
    }
  }

  appendBlockForTextNode(node) {
    const element = node.parentNode
    if (element === this.currentBlockElement && this.isBlockElement(node.previousSibling)) {
      return this.appendStringWithAttributes("\n")
    } else if (element === this.containerElement || this.isBlockElement(element)) {
      const attributes = this.getBlockAttributes(element)
      if (!arraysAreEqual(attributes, this.currentBlock?.attributes)) {
        this.currentBlock = this.appendBlockForAttributesWithElement(attributes, element)
        this.currentBlockElement = element
      }
    }
  }

  appendBlockForElement(element) {
    const elementIsBlockElement = this.isBlockElement(element)
    const currentBlockContainsElement = elementContainsNode(this.currentBlockElement, element)

    if (elementIsBlockElement && !this.isBlockElement(element.firstChild)) {
      if (!this.isInsignificantTextNode(element.firstChild) || !this.isBlockElement(element.firstElementChild)) {
        const attributes = this.getBlockAttributes(element)
        if (element.firstChild) {
          if (!(currentBlockContainsElement && arraysAreEqual(attributes, this.currentBlock.attributes))) {
            this.currentBlock = this.appendBlockForAttributesWithElement(attributes, element)
            this.currentBlockElement = element
          } else {
            return this.appendStringWithAttributes("\n")
          }
        }
      }
    } else if (this.currentBlockElement && !currentBlockContainsElement && !elementIsBlockElement) {
      const parentBlockElement = this.findParentBlockElement(element)
      if (parentBlockElement) {
        return this.appendBlockForElement(parentBlockElement)
      } else {
        this.currentBlock = this.appendEmptyBlock()
        this.currentBlockElement = null
      }
    }
  }

  findParentBlockElement(element) {
    let { parentElement } = element
    while (parentElement && parentElement !== this.containerElement) {
      if (this.isBlockElement(parentElement) && this.blockElements.includes(parentElement)) {
        return parentElement
      } else {
        parentElement = parentElement.parentElement
      }
    }
    return null
  }

  processTextNode(node) {
    let string = node.data
    if (!elementCanDisplayPreformattedText(node.parentNode)) {
      string = squishBreakableWhitespace(string)
      if (stringEndsWithWhitespace(node.previousSibling?.textContent)) {
        string = leftTrimBreakableWhitespace(string)
      }
    }
    return this.appendStringWithAttributes(string, this.getTextAttributes(node.parentNode))
  }

  processElement(element) {
    let attributes
    if (nodeIsAttachmentElement(element)) {
      attributes = parseTrixDataAttribute(element, "attachment")
      if (Object.keys(attributes).length) {
        const textAttributes = this.getTextAttributes(element)
        this.appendAttachmentWithAttributes(attributes, textAttributes)
        // We have everything we need so avoid processing inner nodes
        element.innerHTML = ""
      }
      return this.processedElements.push(element)
    } else {
      switch (tagName(element)) {
        case "br":
          if (!this.isExtraBR(element) && !this.isBlockElement(element.nextSibling)) {
            this.appendStringWithAttributes("\n", this.getTextAttributes(element))
          }
          return this.processedElements.push(element)
        case "img":
          attributes = { url: element.getAttribute("src"), contentType: "image" }
          const object = getImageDimensions(element)
          for (const key in object) {
            const value = object[key]
            attributes[key] = value
          }
          this.appendAttachmentWithAttributes(attributes, this.getTextAttributes(element))
          return this.processedElements.push(element)
        case "tr":
          if (this.needsTableSeparator(element)) {
            return this.appendStringWithAttributes(config.parser.tableRowSeparator)
          }
          break
        case "td":
          if (this.needsTableSeparator(element)) {
            return this.appendStringWithAttributes(config.parser.tableCellSeparator)
          }
          break
      }
    }
  }

  // Document construction

  appendBlockForAttributesWithElement(attributes, element) {
    this.blockElements.push(element)
    const block = blockForAttributes(attributes)
    this.blocks.push(block)
    return block
  }

  appendEmptyBlock() {
    return this.appendBlockForAttributesWithElement([], null)
  }

  appendStringWithAttributes(string, attributes) {
    return this.appendPiece(pieceForString(string, attributes))
  }

  appendAttachmentWithAttributes(attachment, attributes) {
    return this.appendPiece(pieceForAttachment(attachment, attributes))
  }

  appendPiece(piece) {
    if (this.blocks.length === 0) {
      this.appendEmptyBlock()
    }
    return this.blocks[this.blocks.length - 1].text.push(piece)
  }

  appendStringToTextAtIndex(string, index) {
    const { text } = this.blocks[index]
    const piece = text[text.length - 1]

    if (piece?.type === "string") {
      piece.string += string
    } else {
      return text.push(pieceForString(string))
    }
  }

  prependStringToTextAtIndex(string, index) {
    const { text } = this.blocks[index]
    const piece = text[0]

    if (piece?.type === "string") {
      piece.string = string + piece.string
    } else {
      return text.unshift(pieceForString(string))
    }
  }

  // Attribute parsing

  getTextAttributes(element) {
    let value
    const attributes = {}
    for (const attribute in config.textAttributes) {
      const configAttr = config.textAttributes[attribute]
      if (
        configAttr.tagName &&
        findClosestElementFromNode(element, {
          matchingSelector: configAttr.tagName,
          untilNode: this.containerElement,
        })
      ) {
        attributes[attribute] = true
      } else if (configAttr.parser) {
        value = configAttr.parser(element)
        if (value) {
          let attributeInheritedFromBlock = false
          for (const blockElement of this.findBlockElementAncestors(element)) {
            if (configAttr.parser(blockElement) === value) {
              attributeInheritedFromBlock = true
              break
            }
          }
          if (!attributeInheritedFromBlock) {
            attributes[attribute] = value
          }
        }
      } else if (configAttr.styleProperty) {
        value = element.style[configAttr.styleProperty]
        if (value) {
          attributes[attribute] = value
        }
      }
    }

    if (nodeIsAttachmentElement(element)) {
      const object = parseTrixDataAttribute(element, "attributes")
      for (const key in object) {
        value = object[key]
        attributes[key] = value
      }
    }

    return attributes
  }

  getBlockAttributes(element) {
    const attributes = []
    while (element && element !== this.containerElement) {
      for (const attribute in config.blockAttributes) {
        const attrConfig = config.blockAttributes[attribute]
        if (attrConfig.parse !== false) {
          if (tagName(element) === attrConfig.tagName) {
            if (attrConfig.test?.(element) || !attrConfig.test) {
              attributes.push(attribute)
              if (attrConfig.listAttribute) {
                attributes.push(attrConfig.listAttribute)
              }
            }
          }
        }
      }
      element = element.parentNode
    }
    return attributes.reverse()
  }

  findBlockElementAncestors(element) {
    const ancestors = []
    while (element && element !== this.containerElement) {
      const tag = tagName(element)
      if (getBlockTagNames().includes(tag)) {
        ancestors.push(element)
      }
      element = element.parentNode
    }
    return ancestors
  }

  // Element inspection

  isBlockElement(element) {
    if (element?.nodeType !== Node.ELEMENT_NODE) return
    if (nodeIsAttachmentElement(element)) return
    if (findClosestElementFromNode(element, { matchingSelector: "td", untilNode: this.containerElement })) return

    return getBlockTagNames().includes(tagName(element)) ||
      window.getComputedStyle(element).display === "block"
  }

  isInsignificantTextNode(node) {
    if (node?.nodeType !== Node.TEXT_NODE) return
    if (!stringIsAllBreakableWhitespace(node.data)) return
    const { parentNode, previousSibling, nextSibling } = node
    if (nodeEndsWithNonWhitespace(parentNode.previousSibling) && !this.isBlockElement(parentNode.previousSibling)) return
    if (elementCanDisplayPreformattedText(parentNode)) return
    return !previousSibling || this.isBlockElement(previousSibling) || !nextSibling || this.isBlockElement(nextSibling)
  }

  isExtraBR(element) {
    return tagName(element) === "br" && this.isBlockElement(element.parentNode) && element.parentNode.lastChild === element
  }

  needsTableSeparator(element) {
    if (config.parser.removeBlankTableCells) {
      const content = element.previousSibling?.textContent
      return content && /\S/.test(content)
    } else {
      return element.previousSibling
    }
  }

  // Margin translation

  translateBlockElementMarginsToNewlines() {
    const defaultMargin = this.getMarginOfDefaultBlockElement()

    for (let index = 0; index < this.blocks.length; index++) {
      const margin = this.getMarginOfBlockElementAtIndex(index)
      if (margin) {
        if (margin.top > defaultMargin.top * 2) {
          this.prependStringToTextAtIndex("\n", index)
        }

        if (margin.bottom > defaultMargin.bottom * 2) {
          this.appendStringToTextAtIndex("\n", index)
        }
      }
    }
  }

  getMarginOfBlockElementAtIndex(index) {
    const element = this.blockElements[index]
    if (element) {
      if (element.textContent) {
        if (!getBlockTagNames().includes(tagName(element)) && !this.processedElements.includes(element)) {
          return getBlockElementMargin(element)
        }
      }
    }
  }

  getMarginOfDefaultBlockElement() {
    const element = makeElement(config.blockAttributes.default.tagName)
    this.containerElement.appendChild(element)
    return getBlockElementMargin(element)
  }
}

// Helpers

const elementCanDisplayPreformattedText = function(element) {
  const { whiteSpace } = window.getComputedStyle(element)
  return [ "pre", "pre-wrap", "pre-line" ].includes(whiteSpace)
}

const nodeEndsWithNonWhitespace = (node) => node && !stringEndsWithWhitespace(node.textContent)

const getBlockElementMargin = function(element) {
  const style = window.getComputedStyle(element)
  if (style.display === "block") {
    return { top: parseInt(style.marginTop), bottom: parseInt(style.marginBottom) }
  }
}

const nodeFilter = function(node) {
  if (tagName(node) === "style") {
    return NodeFilter.FILTER_REJECT
  } else {
    return NodeFilter.FILTER_ACCEPT
  }
}

// Whitespace

const leftTrimBreakableWhitespace = (string) => string.replace(new RegExp(`^${breakableWhitespacePattern.source}+`), "")

const stringIsAllBreakableWhitespace = (string) => new RegExp(`^${breakableWhitespacePattern.source}*$`).test(string)

const stringEndsWithWhitespace = (string) => /\s$/.test(string)
