import TrixObject from "trix/core/object" // Don't override window.Object
import Text from "trix/models/text"

import {
  arraysAreEqual,
  getBlockConfig,
  getListAttributeNames,
  spliceArray,
} from "trix/core/helpers"

export default class Block extends TrixObject {
  static fromJSON(blockJSON) {
    const text = Text.fromJSON(blockJSON.text)
    return new this(text, blockJSON.attributes)
  }

  constructor(text, attributes) {
    super(...arguments)
    this.text = applyBlockBreakToText(text || new Text())
    this.attributes = attributes || []
  }

  isEmpty() {
    return this.text.isBlockBreak()
  }

  isEqualTo(block) {
    if (super.isEqualTo(block)) return true

    return this.text.isEqualTo(block?.text) && arraysAreEqual(this.attributes, block?.attributes)
  }

  copyWithText(text) {
    return new Block(text, this.attributes)
  }

  copyWithoutText() {
    return this.copyWithText(null)
  }

  copyWithAttributes(attributes) {
    return new Block(this.text, attributes)
  }

  copyWithoutAttributes() {
    return this.copyWithAttributes(null)
  }

  copyUsingObjectMap(objectMap) {
    const mappedText = objectMap.find(this.text)
    if (mappedText) {
      return this.copyWithText(mappedText)
    } else {
      return this.copyWithText(this.text.copyUsingObjectMap(objectMap))
    }
  }

  addAttribute(attribute) {
    const attributes = this.attributes.concat(expandAttribute(attribute))
    return this.copyWithAttributes(attributes)
  }

  removeAttribute(attribute) {
    const { listAttribute } = getBlockConfig(attribute)
    const attributes = removeLastValue(removeLastValue(this.attributes, attribute), listAttribute)
    return this.copyWithAttributes(attributes)
  }

  removeLastAttribute() {
    return this.removeAttribute(this.getLastAttribute())
  }

  getLastAttribute() {
    return getLastElement(this.attributes)
  }

  getAttributes() {
    return this.attributes.slice(0)
  }

  getAttributeLevel() {
    return this.attributes.length
  }

  getAttributeAtLevel(level) {
    return this.attributes[level - 1]
  }

  hasAttribute(attributeName) {
    return this.attributes.includes(attributeName)
  }

  hasAttributes() {
    return this.getAttributeLevel() > 0
  }

  getLastNestableAttribute() {
    return getLastElement(this.getNestableAttributes())
  }

  getNestableAttributes() {
    return this.attributes.filter((attribute) => getBlockConfig(attribute).nestable)
  }

  getNestingLevel() {
    return this.getNestableAttributes().length
  }

  decreaseNestingLevel() {
    const attribute = this.getLastNestableAttribute()
    if (attribute) {
      return this.removeAttribute(attribute)
    } else {
      return this
    }
  }

  increaseNestingLevel() {
    const attribute = this.getLastNestableAttribute()
    if (attribute) {
      const index = this.attributes.lastIndexOf(attribute)
      const attributes = spliceArray(this.attributes, index + 1, 0, ...expandAttribute(attribute))
      return this.copyWithAttributes(attributes)
    } else {
      return this
    }
  }

  getListItemAttributes() {
    return this.attributes.filter((attribute) => getBlockConfig(attribute).listAttribute)
  }

  isListItem() {
    return getBlockConfig(this.getLastAttribute())?.listAttribute
  }

  isTerminalBlock() {
    return getBlockConfig(this.getLastAttribute())?.terminal
  }

  breaksOnReturn() {
    return getBlockConfig(this.getLastAttribute())?.breakOnReturn
  }

  findLineBreakInDirectionFromPosition(direction, position) {
    const string = this.toString()
    let result
    switch (direction) {
      case "forward":
        result = string.indexOf("\n", position)
        break
      case "backward":
        result = string.slice(0, position).lastIndexOf("\n")
    }

    if (result !== -1) {
      return result
    }
  }

  contentsForInspection() {
    return {
      text: this.text.inspect(),
      attributes: this.attributes,
    }
  }

  toString() {
    return this.text.toString()
  }

  toJSON() {
    return {
      text: this.text,
      attributes: this.attributes,
    }
  }

  // BIDI

  getDirection() {
    return this.text.getDirection()
  }

  isRTL() {
    return this.text.isRTL()
  }

  // Splittable

  getLength() {
    return this.text.getLength()
  }

  canBeConsolidatedWith(block) {
    return !this.hasAttributes() && !block.hasAttributes() && this.getDirection() === block.getDirection()
  }

  consolidateWith(block) {
    const newlineText = Text.textForStringWithAttributes("\n")
    const text = this.getTextWithoutBlockBreak().appendText(newlineText)
    return this.copyWithText(text.appendText(block.text))
  }

  splitAtOffset(offset) {
    let left, right
    if (offset === 0) {
      left = null
      right = this
    } else if (offset === this.getLength()) {
      left = this
      right = null
    } else {
      left = this.copyWithText(this.text.getTextAtRange([ 0, offset ]))
      right = this.copyWithText(this.text.getTextAtRange([ offset, this.getLength() ]))
    }
    return [ left, right ]
  }

  getBlockBreakPosition() {
    return this.text.getLength() - 1
  }

  getTextWithoutBlockBreak() {
    if (textEndsInBlockBreak(this.text)) {
      return this.text.getTextAtRange([ 0, this.getBlockBreakPosition() ])
    } else {
      return this.text.copy()
    }
  }

  // Grouping

  canBeGrouped(depth) {
    return this.attributes[depth]
  }

  canBeGroupedWith(otherBlock, depth) {
    const otherAttributes = otherBlock.getAttributes()
    const otherAttribute = otherAttributes[depth]
    const attribute = this.attributes[depth]

    return (
      attribute === otherAttribute &&
      !(getBlockConfig(attribute).group === false && !getListAttributeNames().includes(otherAttributes[depth + 1])) &&
      (this.getDirection() === otherBlock.getDirection() || otherBlock.isEmpty())
    )
  }
}

// Block breaks

const applyBlockBreakToText = function(text) {
  text = unmarkExistingInnerBlockBreaksInText(text)
  text = addBlockBreakToText(text)
  return text
}

const unmarkExistingInnerBlockBreaksInText = function(text) {
  let modified = false
  const pieces = text.getPieces()

  let innerPieces = pieces.slice(0, pieces.length - 1)
  const lastPiece = pieces[pieces.length - 1]

  if (!lastPiece) return text

  innerPieces = innerPieces.map((piece) => {
    if (piece.isBlockBreak()) {
      modified = true
      return unmarkBlockBreakPiece(piece)
    } else {
      return piece
    }
  })

  if (modified) {
    return new Text([ ...innerPieces, lastPiece ])
  } else {
    return text
  }
}

const blockBreakText = Text.textForStringWithAttributes("\n", { blockBreak: true })

const addBlockBreakToText = function(text) {
  if (textEndsInBlockBreak(text)) {
    return text
  } else {
    return text.appendText(blockBreakText)
  }
}

const textEndsInBlockBreak = function(text) {
  const length = text.getLength()
  if (length === 0) {
    return false
  }
  const endText = text.getTextAtRange([ length - 1, length ])
  return endText.isBlockBreak()
}

const unmarkBlockBreakPiece = (piece) => piece.copyWithoutAttribute("blockBreak")

// Attributes

const expandAttribute = function(attribute) {
  const { listAttribute } = getBlockConfig(attribute)
  if (listAttribute) {
    return [ listAttribute, attribute ]
  } else {
    return [ attribute ]
  }
}

// Array helpers

const getLastElement = (array) => array.slice(-1)[0]

const removeLastValue = function(array, value) {
  const index = array.lastIndexOf(value)
  if (index === -1) {
    return array
  } else {
    return spliceArray(array, index, 1)
  }
}
