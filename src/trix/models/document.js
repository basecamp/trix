import * as config from "trix/config"
import TrixObject from "trix/core/object" // Don't override window.Object

import Text from "trix/models/text"
import Block from "trix/models/block"
import SplittableList from "trix/models/splittable_list"
import Hash from "trix/core/collections/hash"
import ObjectMap from "trix/core/collections/object_map"

import { arraysAreEqual, getBlockConfig, normalizeRange, rangeIsCollapsed } from "trix/core/helpers"

export default class Document extends TrixObject {
  static fromJSON(documentJSON) {
    const blocks = Array.from(documentJSON).map((blockJSON) => Block.fromJSON(blockJSON))
    return new this(blocks)
  }

  static fromString(string, textAttributes) {
    const text = Text.textForStringWithAttributes(string, textAttributes)
    return new this([ new Block(text) ])
  }

  constructor(blocks = []) {
    super(...arguments)
    if (blocks.length === 0) {
      blocks = [ new Block() ]
    }
    this.blockList = SplittableList.box(blocks)
  }

  isEmpty() {
    const block = this.getBlockAtIndex(0)
    return this.blockList.length === 1 && block.isEmpty() && !block.hasAttributes()
  }

  copy(options = {}) {
    const blocks = options.consolidateBlocks ? this.blockList.consolidate().toArray() : this.blockList.toArray()

    return new this.constructor(blocks)
  }

  copyUsingObjectsFromDocument(sourceDocument) {
    const objectMap = new ObjectMap(sourceDocument.getObjects())
    return this.copyUsingObjectMap(objectMap)
  }

  copyUsingObjectMap(objectMap) {
    const blocks = this.getBlocks().map((block) => {
      const mappedBlock = objectMap.find(block)
      return mappedBlock || block.copyUsingObjectMap(objectMap)
    })
    return new this.constructor(blocks)
  }

  copyWithBaseBlockAttributes(blockAttributes = []) {
    const blocks = this.getBlocks().map((block) => {
      const attributes = blockAttributes.concat(block.getAttributes())
      return block.copyWithAttributes(attributes)
    })

    return new this.constructor(blocks)
  }

  replaceBlock(oldBlock, newBlock) {
    const index = this.blockList.indexOf(oldBlock)
    if (index === -1) {
      return this
    }
    return new this.constructor(this.blockList.replaceObjectAtIndex(newBlock, index))
  }

  insertDocumentAtRange(document, range) {
    const { blockList } = document
    range = normalizeRange(range)
    let [ position ] = range
    const { index, offset } = this.locationFromPosition(position)

    let result = this
    const block = this.getBlockAtPosition(position)

    if (rangeIsCollapsed(range) && block.isEmpty() && !block.hasAttributes()) {
      result = new this.constructor(result.blockList.removeObjectAtIndex(index))
    } else if (block.getBlockBreakPosition() === offset) {
      position++
    }

    result = result.removeTextAtRange(range)
    return new this.constructor(result.blockList.insertSplittableListAtPosition(blockList, position))
  }

  mergeDocumentAtRange(document, range) {
    let formattedDocument, result
    range = normalizeRange(range)
    const [ startPosition ] = range
    const startLocation = this.locationFromPosition(startPosition)
    const blockAttributes = this.getBlockAtIndex(startLocation.index).getAttributes()
    const baseBlockAttributes = document.getBaseBlockAttributes()
    const trailingBlockAttributes = blockAttributes.slice(-baseBlockAttributes.length)

    if (arraysAreEqual(baseBlockAttributes, trailingBlockAttributes)) {
      const leadingBlockAttributes = blockAttributes.slice(0, -baseBlockAttributes.length)
      formattedDocument = document.copyWithBaseBlockAttributes(leadingBlockAttributes)
    } else {
      formattedDocument = document.copy({ consolidateBlocks: true }).copyWithBaseBlockAttributes(blockAttributes)
    }

    const blockCount = formattedDocument.getBlockCount()
    const firstBlock = formattedDocument.getBlockAtIndex(0)

    if (arraysAreEqual(blockAttributes, firstBlock.getAttributes())) {
      const firstText = firstBlock.getTextWithoutBlockBreak()
      result = this.insertTextAtRange(firstText, range)

      if (blockCount > 1) {
        formattedDocument = new this.constructor(formattedDocument.getBlocks().slice(1))
        const position = startPosition + firstText.getLength()
        result = result.insertDocumentAtRange(formattedDocument, position)
      }
    } else {
      result = this.insertDocumentAtRange(formattedDocument, range)
    }

    return result
  }

  insertTextAtRange(text, range) {
    range = normalizeRange(range)
    const [ startPosition ] = range
    const { index, offset } = this.locationFromPosition(startPosition)

    const document = this.removeTextAtRange(range)
    return new this.constructor(
      document.blockList.editObjectAtIndex(index, (block) =>
        block.copyWithText(block.text.insertTextAtPosition(text, offset))
      )
    )
  }

  removeTextAtRange(range) {
    let blocks
    range = normalizeRange(range)
    const [ leftPosition, rightPosition ] = range
    if (rangeIsCollapsed(range)) {
      return this
    }
    const [ leftLocation, rightLocation ] = Array.from(this.locationRangeFromRange(range))

    const leftIndex = leftLocation.index
    const leftOffset = leftLocation.offset
    const leftBlock = this.getBlockAtIndex(leftIndex)

    const rightIndex = rightLocation.index
    const rightOffset = rightLocation.offset
    const rightBlock = this.getBlockAtIndex(rightIndex)

    const removeRightNewline =
      rightPosition - leftPosition === 1 &&
      leftBlock.getBlockBreakPosition() === leftOffset &&
      rightBlock.getBlockBreakPosition() !== rightOffset &&
      rightBlock.text.getStringAtPosition(rightOffset) === "\n"

    if (removeRightNewline) {
      blocks = this.blockList.editObjectAtIndex(rightIndex, (block) =>
        block.copyWithText(block.text.removeTextAtRange([ rightOffset, rightOffset + 1 ]))
      )
    } else {
      let block
      const leftText = leftBlock.text.getTextAtRange([ 0, leftOffset ])
      const rightText = rightBlock.text.getTextAtRange([ rightOffset, rightBlock.getLength() ])
      const text = leftText.appendText(rightText)

      const removingLeftBlock = leftIndex !== rightIndex && leftOffset === 0
      const useRightBlock = removingLeftBlock && leftBlock.getAttributeLevel() >= rightBlock.getAttributeLevel()

      if (useRightBlock) {
        block = rightBlock.copyWithText(text)
      } else {
        block = leftBlock.copyWithText(text)
      }

      const affectedBlockCount = rightIndex + 1 - leftIndex
      blocks = this.blockList.splice(leftIndex, affectedBlockCount, block)
    }

    return new this.constructor(blocks)
  }

  moveTextFromRangeToPosition(range, position) {
    let text
    range = normalizeRange(range)
    const [ startPosition, endPosition ] = range
    if (startPosition <= position && position <= endPosition) {
      return this
    }

    let document = this.getDocumentAtRange(range)
    let result = this.removeTextAtRange(range)

    const movingRightward = startPosition < position
    if (movingRightward) {
      position -= document.getLength()
    }

    const [ firstBlock, ...blocks ] = document.getBlocks()
    if (blocks.length === 0) {
      text = firstBlock.getTextWithoutBlockBreak()
      if (movingRightward) {
        position += 1
      }
    } else {
      text = firstBlock.text
    }

    result = result.insertTextAtRange(text, position)
    if (blocks.length === 0) {
      return result
    }

    document = new this.constructor(blocks)
    position += text.getLength()

    return result.insertDocumentAtRange(document, position)
  }

  addAttributeAtRange(attribute, value, range) {
    let { blockList } = this
    this.eachBlockAtRange(
      range,
      (block, textRange, index) =>
        blockList = blockList.editObjectAtIndex(index, function() {
          if (getBlockConfig(attribute)) {
            return block.addAttribute(attribute, value)
          } else {
            if (textRange[0] === textRange[1]) {
              return block
            } else {
              return block.copyWithText(block.text.addAttributeAtRange(attribute, value, textRange))
            }
          }
        })
    )
    return new this.constructor(blockList)
  }

  addAttribute(attribute, value) {
    let { blockList } = this
    this.eachBlock(
      (block, index) => blockList = blockList.editObjectAtIndex(index, () => block.addAttribute(attribute, value))
    )
    return new this.constructor(blockList)
  }

  removeAttributeAtRange(attribute, range) {
    let { blockList } = this
    this.eachBlockAtRange(range, function(block, textRange, index) {
      if (getBlockConfig(attribute)) {
        blockList = blockList.editObjectAtIndex(index, () => block.removeAttribute(attribute))
      } else if (textRange[0] !== textRange[1]) {
        blockList = blockList.editObjectAtIndex(index, () =>
          block.copyWithText(block.text.removeAttributeAtRange(attribute, textRange))
        )
      }
    })
    return new this.constructor(blockList)
  }

  updateAttributesForAttachment(attributes, attachment) {
    const range = this.getRangeOfAttachment(attachment)
    const [ startPosition ] = Array.from(range)
    const { index } = this.locationFromPosition(startPosition)
    const text = this.getTextAtIndex(index)

    return new this.constructor(
      this.blockList.editObjectAtIndex(index, (block) =>
        block.copyWithText(text.updateAttributesForAttachment(attributes, attachment))
      )
    )
  }

  removeAttributeForAttachment(attribute, attachment) {
    const range = this.getRangeOfAttachment(attachment)
    return this.removeAttributeAtRange(attribute, range)
  }

  insertBlockBreakAtRange(range) {
    let blocks
    range = normalizeRange(range)
    const [ startPosition ] = range
    const { offset } = this.locationFromPosition(startPosition)

    const document = this.removeTextAtRange(range)
    if (offset === 0) {
      blocks = [ new Block() ]
    }
    return new this.constructor(
      document.blockList.insertSplittableListAtPosition(new SplittableList(blocks), startPosition)
    )
  }

  applyBlockAttributeAtRange(attributeName, value, range) {
    const expanded = this.expandRangeToLineBreaksAndSplitBlocks(range)
    let document = expanded.document
    range = expanded.range
    const blockConfig = getBlockConfig(attributeName)

    if (blockConfig.listAttribute) {
      document = document.removeLastListAttributeAtRange(range, { exceptAttributeName: attributeName })
      const converted = document.convertLineBreaksToBlockBreaksInRange(range)
      document = converted.document
      range = converted.range
    } else if (blockConfig.exclusive) {
      document = document.removeBlockAttributesAtRange(range)
    } else if (blockConfig.terminal) {
      document = document.removeLastTerminalAttributeAtRange(range)
    } else {
      document = document.consolidateBlocksAtRange(range)
    }

    return document.addAttributeAtRange(attributeName, value, range)
  }

  removeLastListAttributeAtRange(range, options = {}) {
    let { blockList } = this
    this.eachBlockAtRange(range, function(block, textRange, index) {
      const lastAttributeName = block.getLastAttribute()
      if (!lastAttributeName) {
        return
      }
      if (!getBlockConfig(lastAttributeName).listAttribute) {
        return
      }
      if (lastAttributeName === options.exceptAttributeName) {
        return
      }
      blockList = blockList.editObjectAtIndex(index, () => block.removeAttribute(lastAttributeName))
    })
    return new this.constructor(blockList)
  }

  removeLastTerminalAttributeAtRange(range) {
    let { blockList } = this
    this.eachBlockAtRange(range, function(block, textRange, index) {
      const lastAttributeName = block.getLastAttribute()
      if (!lastAttributeName) {
        return
      }
      if (!getBlockConfig(lastAttributeName).terminal) {
        return
      }
      blockList = blockList.editObjectAtIndex(index, () => block.removeAttribute(lastAttributeName))
    })
    return new this.constructor(blockList)
  }

  removeBlockAttributesAtRange(range) {
    let { blockList } = this
    this.eachBlockAtRange(range, function(block, textRange, index) {
      if (block.hasAttributes()) {
        blockList = blockList.editObjectAtIndex(index, () => block.copyWithoutAttributes())
      }
    })
    return new this.constructor(blockList)
  }

  expandRangeToLineBreaksAndSplitBlocks(range) {
    let position
    range = normalizeRange(range)
    let [ startPosition, endPosition ] = range
    const startLocation = this.locationFromPosition(startPosition)
    const endLocation = this.locationFromPosition(endPosition)
    let document = this

    const startBlock = document.getBlockAtIndex(startLocation.index)
    startLocation.offset = startBlock.findLineBreakInDirectionFromPosition("backward", startLocation.offset)
    if (startLocation.offset != null) {
      position = document.positionFromLocation(startLocation)
      document = document.insertBlockBreakAtRange([ position, position + 1 ])
      endLocation.index += 1
      endLocation.offset -= document.getBlockAtIndex(startLocation.index).getLength()
      startLocation.index += 1
    }
    startLocation.offset = 0

    if (endLocation.offset === 0 && endLocation.index > startLocation.index) {
      endLocation.index -= 1
      endLocation.offset = document.getBlockAtIndex(endLocation.index).getBlockBreakPosition()
    } else {
      const endBlock = document.getBlockAtIndex(endLocation.index)
      if (endBlock.text.getStringAtRange([ endLocation.offset - 1, endLocation.offset ]) === "\n") {
        endLocation.offset -= 1
      } else {
        endLocation.offset = endBlock.findLineBreakInDirectionFromPosition("forward", endLocation.offset)
      }
      if (endLocation.offset !== endBlock.getBlockBreakPosition()) {
        position = document.positionFromLocation(endLocation)
        document = document.insertBlockBreakAtRange([ position, position + 1 ])
      }
    }

    startPosition = document.positionFromLocation(startLocation)
    endPosition = document.positionFromLocation(endLocation)
    range = normalizeRange([ startPosition, endPosition ])

    return { document, range }
  }

  convertLineBreaksToBlockBreaksInRange(range) {
    range = normalizeRange(range)
    let [ position ] = range
    const string = this.getStringAtRange(range).slice(0, -1)
    let document = this

    string.replace(/.*?\n/g, function(match) {
      position += match.length
      document = document.insertBlockBreakAtRange([ position - 1, position ])
    })

    return { document, range }
  }

  consolidateBlocksAtRange(range) {
    range = normalizeRange(range)
    const [ startPosition, endPosition ] = range
    const startIndex = this.locationFromPosition(startPosition).index
    const endIndex = this.locationFromPosition(endPosition).index
    return new this.constructor(this.blockList.consolidateFromIndexToIndex(startIndex, endIndex))
  }

  getDocumentAtRange(range) {
    range = normalizeRange(range)
    const blocks = this.blockList.getSplittableListInRange(range).toArray()
    return new this.constructor(blocks)
  }

  getStringAtRange(range) {
    let endIndex
    const array = range = normalizeRange(range),
      endPosition = array[array.length - 1]
    if (endPosition !== this.getLength()) {
      endIndex = -1
    }
    return this.getDocumentAtRange(range).toString().slice(0, endIndex)
  }

  getBlockAtIndex(index) {
    return this.blockList.getObjectAtIndex(index)
  }

  getBlockAtPosition(position) {
    const { index } = this.locationFromPosition(position)
    return this.getBlockAtIndex(index)
  }

  getTextAtIndex(index) {
    return this.getBlockAtIndex(index)?.text
  }

  getTextAtPosition(position) {
    const { index } = this.locationFromPosition(position)
    return this.getTextAtIndex(index)
  }

  getPieceAtPosition(position) {
    const { index, offset } = this.locationFromPosition(position)
    return this.getTextAtIndex(index).getPieceAtPosition(offset)
  }

  getCharacterAtPosition(position) {
    const { index, offset } = this.locationFromPosition(position)
    return this.getTextAtIndex(index).getStringAtRange([ offset, offset + 1 ])
  }

  getLength() {
    return this.blockList.getEndPosition()
  }

  getBlocks() {
    return this.blockList.toArray()
  }

  getBlockCount() {
    return this.blockList.length
  }

  getEditCount() {
    return this.editCount
  }

  eachBlock(callback) {
    return this.blockList.eachObject(callback)
  }

  eachBlockAtRange(range, callback) {
    let block, textRange
    range = normalizeRange(range)
    const [ startPosition, endPosition ] = range
    const startLocation = this.locationFromPosition(startPosition)
    const endLocation = this.locationFromPosition(endPosition)

    if (startLocation.index === endLocation.index) {
      block = this.getBlockAtIndex(startLocation.index)
      textRange = [ startLocation.offset, endLocation.offset ]
      return callback(block, textRange, startLocation.index)
    } else {
      for (let index = startLocation.index; index <= endLocation.index; index++) {
        block = this.getBlockAtIndex(index)
        if (block) {
          switch (index) {
            case startLocation.index:
              textRange = [ startLocation.offset, block.text.getLength() ]
              break
            case endLocation.index:
              textRange = [ 0, endLocation.offset ]
              break
            default:
              textRange = [ 0, block.text.getLength() ]
          }
          callback(block, textRange, index)
        }
      }
    }
  }

  getCommonAttributesAtRange(range) {
    range = normalizeRange(range)
    const [ startPosition ] = range
    if (rangeIsCollapsed(range)) {
      return this.getCommonAttributesAtPosition(startPosition)
    } else {
      const textAttributes = []
      const blockAttributes = []

      this.eachBlockAtRange(range, function(block, textRange) {
        if (textRange[0] !== textRange[1]) {
          textAttributes.push(block.text.getCommonAttributesAtRange(textRange))
          return blockAttributes.push(attributesForBlock(block))
        }
      })

      return Hash.fromCommonAttributesOfObjects(textAttributes)
        .merge(Hash.fromCommonAttributesOfObjects(blockAttributes))
        .toObject()
    }
  }

  getCommonAttributesAtPosition(position) {
    let key, value
    const { index, offset } = this.locationFromPosition(position)
    const block = this.getBlockAtIndex(index)
    if (!block) {
      return {}
    }

    const commonAttributes = attributesForBlock(block)
    const attributes = block.text.getAttributesAtPosition(offset)
    const attributesLeft = block.text.getAttributesAtPosition(offset - 1)
    const inheritableAttributes = Object.keys(config.textAttributes).filter((key) => {
      return config.textAttributes[key].inheritable
    })

    for (key in attributesLeft) {
      value = attributesLeft[key]
      if (value === attributes[key] || inheritableAttributes.includes(key)) {
        commonAttributes[key] = value
      }
    }

    return commonAttributes
  }

  getRangeOfCommonAttributeAtPosition(attributeName, position) {
    const { index, offset } = this.locationFromPosition(position)
    const text = this.getTextAtIndex(index)
    const [ startOffset, endOffset ] = Array.from(text.getExpandedRangeForAttributeAtOffset(attributeName, offset))

    const start = this.positionFromLocation({ index, offset: startOffset })
    const end = this.positionFromLocation({ index, offset: endOffset })
    return normalizeRange([ start, end ])
  }

  getBaseBlockAttributes() {
    let baseBlockAttributes = this.getBlockAtIndex(0).getAttributes()

    for (let blockIndex = 1; blockIndex < this.getBlockCount(); blockIndex++) {
      const blockAttributes = this.getBlockAtIndex(blockIndex).getAttributes()
      const lastAttributeIndex = Math.min(baseBlockAttributes.length, blockAttributes.length)

      baseBlockAttributes = (() => {
        const result = []
        for (let index = 0; index < lastAttributeIndex; index++) {
          if (blockAttributes[index] !== baseBlockAttributes[index]) {
            break
          }
          result.push(blockAttributes[index])
        }
        return result
      })()
    }

    return baseBlockAttributes
  }

  getAttachmentById(attachmentId) {
    for (const attachment of this.getAttachments()) {
      if (attachment.id === attachmentId) {
        return attachment
      }
    }
  }

  getAttachmentPieces() {
    let attachmentPieces = []
    this.blockList.eachObject(({ text }) => attachmentPieces = attachmentPieces.concat(text.getAttachmentPieces()))
    return attachmentPieces
  }

  getAttachments() {
    return this.getAttachmentPieces().map((piece) => piece.attachment)
  }

  getRangeOfAttachment(attachment) {
    let position = 0
    const iterable = this.blockList.toArray()
    for (let index = 0; index < iterable.length; index++) {
      const { text } = iterable[index]
      const textRange = text.getRangeOfAttachment(attachment)
      if (textRange) {
        return normalizeRange([ position + textRange[0], position + textRange[1] ])
      }
      position += text.getLength()
    }
  }

  getLocationRangeOfAttachment(attachment) {
    const range = this.getRangeOfAttachment(attachment)
    return this.locationRangeFromRange(range)
  }

  getAttachmentPieceForAttachment(attachment) {
    for (const piece of this.getAttachmentPieces()) {
      if (piece.attachment === attachment) {
        return piece
      }
    }
  }

  findRangesForBlockAttribute(attributeName) {
    let position = 0
    const ranges = []

    this.getBlocks().forEach((block) => {
      const length = block.getLength()
      if (block.hasAttribute(attributeName)) {
        ranges.push([ position, position + length ])
      }
      position += length
    })

    return ranges
  }

  findRangesForTextAttribute(attributeName, { withValue } = {}) {
    let position = 0
    let range = []
    const ranges = []

    const match = function(piece) {
      if (withValue) {
        return piece.getAttribute(attributeName) === withValue
      } else {
        return piece.hasAttribute(attributeName)
      }
    }

    this.getPieces().forEach((piece) => {
      const length = piece.getLength()
      if (match(piece)) {
        if (range[1] === position) {
          range[1] = position + length
        } else {
          ranges.push(range = [ position, position + length ])
        }
      }
      position += length
    })

    return ranges
  }

  locationFromPosition(position) {
    const location = this.blockList.findIndexAndOffsetAtPosition(Math.max(0, position))
    if (location.index != null) {
      return location
    } else {
      const blocks = this.getBlocks()
      return { index: blocks.length - 1, offset: blocks[blocks.length - 1].getLength() }
    }
  }

  positionFromLocation(location) {
    return this.blockList.findPositionAtIndexAndOffset(location.index, location.offset)
  }

  locationRangeFromPosition(position) {
    return normalizeRange(this.locationFromPosition(position))
  }

  locationRangeFromRange(range) {
    range = normalizeRange(range)
    if (!range) return

    const [ startPosition, endPosition ] = Array.from(range)
    const startLocation = this.locationFromPosition(startPosition)
    const endLocation = this.locationFromPosition(endPosition)
    return normalizeRange([ startLocation, endLocation ])
  }

  rangeFromLocationRange(locationRange) {
    let rightPosition
    locationRange = normalizeRange(locationRange)
    const leftPosition = this.positionFromLocation(locationRange[0])
    if (!rangeIsCollapsed(locationRange)) {
      rightPosition = this.positionFromLocation(locationRange[1])
    }
    return normalizeRange([ leftPosition, rightPosition ])
  }

  isEqualTo(document) {
    return this.blockList.isEqualTo(document?.blockList)
  }

  getTexts() {
    return this.getBlocks().map((block) => block.text)
  }

  getPieces() {
    const pieces = []

    Array.from(this.getTexts()).forEach((text) => {
      pieces.push(...Array.from(text.getPieces() || []))
    })

    return pieces
  }

  getObjects() {
    return this.getBlocks().concat(this.getTexts()).concat(this.getPieces())
  }

  toSerializableDocument() {
    const blocks = []
    this.blockList.eachObject((block) => blocks.push(block.copyWithText(block.text.toSerializableText())))
    return new this.constructor(blocks)
  }

  toString() {
    return this.blockList.toString()
  }

  toJSON() {
    return this.blockList.toJSON()
  }

  toConsole() {
    return JSON.stringify(this.blockList.toArray().map((block) => JSON.parse(block.text.toConsole())))
  }
}

const attributesForBlock = function(block) {
  const attributes = {}
  const attributeName = block.getLastAttribute()
  if (attributeName) {
    attributes[attributeName] = true
  }
  return attributes
}
