import * as config from "trix/config"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import BasicObject from "trix/core/basic_object"
import Text from "trix/models/text"
import Block from "trix/models/block"
import Attachment from "trix/models/attachment"
import Document from "trix/models/document"
import HTMLParser from "trix/models/html_parser"
import LineBreakInsertion from "trix/models/line_break_insertion"

import {
  arrayStartsWith,
  extend,
  getAllAttributeNames,
  getBlockConfig,
  getTextConfig,
  normalizeRange,
  objectsAreEqual,
  rangeIsCollapsed,
  rangesAreEqual,
  summarizeArrayChange,
} from "trix/core/helpers"

const PLACEHOLDER = " "

export default class Composition extends BasicObject {
  constructor() {
    super(...arguments)
    this.document = new Document()
    this.attachments = []
    this.currentAttributes = {}
    this.revision = 0
  }

  setDocument(document) {
    if (!document.isEqualTo(this.document)) {
      this.document = document
      this.refreshAttachments()
      this.revision++
      return this.delegate?.compositionDidChangeDocument?.(document)
    }
  }

  // Snapshots

  getSnapshot() {
    return {
      document: this.document,
      selectedRange: this.getSelectedRange(),
    }
  }

  loadSnapshot({ document, selectedRange }) {
    this.delegate?.compositionWillLoadSnapshot?.()
    this.setDocument(document != null ? document : new Document())
    this.setSelection(selectedRange != null ? selectedRange : [ 0, 0 ])
    return this.delegate?.compositionDidLoadSnapshot?.()
  }

  // Responder protocol

  insertText(text, { updatePosition } = { updatePosition: true }) {
    const selectedRange = this.getSelectedRange()
    this.setDocument(this.document.insertTextAtRange(text, selectedRange))

    const startPosition = selectedRange[0]
    const endPosition = startPosition + text.getLength()

    if (updatePosition) {
      this.setSelection(endPosition)
    }
    return this.notifyDelegateOfInsertionAtRange([ startPosition, endPosition ])
  }

  insertBlock(block = new Block()) {
    const document = new Document([ block ])
    return this.insertDocument(document)
  }

  insertDocument(document = new Document()) {
    const selectedRange = this.getSelectedRange()
    this.setDocument(this.document.insertDocumentAtRange(document, selectedRange))

    const startPosition = selectedRange[0]
    const endPosition = startPosition + document.getLength()

    this.setSelection(endPosition)
    return this.notifyDelegateOfInsertionAtRange([ startPosition, endPosition ])
  }

  insertString(string, options) {
    const attributes = this.getCurrentTextAttributes()
    const text = Text.textForStringWithAttributes(string, attributes)
    return this.insertText(text, options)
  }

  insertBlockBreak() {
    const selectedRange = this.getSelectedRange()
    this.setDocument(this.document.insertBlockBreakAtRange(selectedRange))

    const startPosition = selectedRange[0]
    const endPosition = startPosition + 1

    this.setSelection(endPosition)
    return this.notifyDelegateOfInsertionAtRange([ startPosition, endPosition ])
  }

  insertLineBreak() {
    const insertion = new LineBreakInsertion(this)

    if (insertion.shouldDecreaseListLevel()) {
      this.decreaseListLevel()
      return this.setSelection(insertion.startPosition)
    } else if (insertion.shouldPrependListItem()) {
      const document = new Document([ insertion.block.copyWithoutText() ])
      return this.insertDocument(document)
    } else if (insertion.shouldInsertBlockBreak()) {
      return this.insertBlockBreak()
    } else if (insertion.shouldRemoveLastBlockAttribute()) {
      return this.removeLastBlockAttribute()
    } else if (insertion.shouldBreakFormattedBlock()) {
      return this.breakFormattedBlock(insertion)
    } else {
      return this.insertString("\n")
    }
  }

  insertHTML(html) {
    const document = HTMLParser.parse(html).getDocument()
    const selectedRange = this.getSelectedRange()

    this.setDocument(this.document.mergeDocumentAtRange(document, selectedRange))

    const startPosition = selectedRange[0]
    const endPosition = startPosition + document.getLength() - 1

    this.setSelection(endPosition)
    return this.notifyDelegateOfInsertionAtRange([ startPosition, endPosition ])
  }

  replaceHTML(html) {
    const document = HTMLParser.parse(html).getDocument().copyUsingObjectsFromDocument(this.document)
    const locationRange = this.getLocationRange({ strict: false })
    const selectedRange = this.document.rangeFromLocationRange(locationRange)
    this.setDocument(document)
    return this.setSelection(selectedRange)
  }

  insertFile(file) {
    return this.insertFiles([ file ])
  }

  insertFiles(files) {
    const attachments = []

    Array.from(files).forEach((file) => {
      if (this.delegate?.compositionShouldAcceptFile(file)) {
        const attachment = Attachment.attachmentForFile(file)
        attachments.push(attachment)
      }
    })

    return this.insertAttachments(attachments)
  }

  insertAttachment(attachment) {
    return this.insertAttachments([ attachment ])
  }

  insertAttachments(attachments) {
    let text = new Text()

    Array.from(attachments).forEach((attachment) => {
      const type = attachment.getType()
      const presentation = config.attachments[type]?.presentation

      const attributes = this.getCurrentTextAttributes()
      if (presentation) {
        attributes.presentation = presentation
      }

      const attachmentText = Text.textForAttachmentWithAttributes(attachment, attributes)
      text = text.appendText(attachmentText)
    })

    return this.insertText(text)
  }

  shouldManageDeletingInDirection(direction) {
    const locationRange = this.getLocationRange()
    if (rangeIsCollapsed(locationRange)) {
      if (direction === "backward" && locationRange[0].offset === 0) {
        return true
      }
      if (this.shouldManageMovingCursorInDirection(direction)) {
        return true
      }
    } else {
      if (locationRange[0].index !== locationRange[1].index) {
        return true
      }
    }
    return false
  }

  deleteInDirection(direction, { length } = {}) {
    let attachment, deletingIntoPreviousBlock, selectionSpansBlocks
    const locationRange = this.getLocationRange()
    let range = this.getSelectedRange()
    const selectionIsCollapsed = rangeIsCollapsed(range)

    if (selectionIsCollapsed) {
      deletingIntoPreviousBlock = direction === "backward" && locationRange[0].offset === 0
    } else {
      selectionSpansBlocks = locationRange[0].index !== locationRange[1].index
    }

    if (deletingIntoPreviousBlock) {
      if (this.canDecreaseBlockAttributeLevel()) {
        const block = this.getBlock()

        if (block.isListItem()) {
          this.decreaseListLevel()
        } else {
          this.decreaseBlockAttributeLevel()
        }

        this.setSelection(range[0])
        if (block.isEmpty()) {
          return false
        }
      }
    }

    if (selectionIsCollapsed) {
      range = this.getExpandedRangeInDirection(direction, { length })
      if (direction === "backward") {
        attachment = this.getAttachmentAtRange(range)
      }
    }

    if (attachment) {
      this.editAttachment(attachment)
      return false
    } else {
      this.setDocument(this.document.removeTextAtRange(range))
      this.setSelection(range[0])
      if (deletingIntoPreviousBlock || selectionSpansBlocks) {
        return false
      }
    }
  }

  moveTextFromRange(range) {
    const [ position ] = Array.from(this.getSelectedRange())
    this.setDocument(this.document.moveTextFromRangeToPosition(range, position))
    return this.setSelection(position)
  }

  removeAttachment(attachment) {
    const range = this.document.getRangeOfAttachment(attachment)
    if (range) {
      this.stopEditingAttachment()
      this.setDocument(this.document.removeTextAtRange(range))
      return this.setSelection(range[0])
    }
  }

  removeLastBlockAttribute() {
    const [ startPosition, endPosition ] = Array.from(this.getSelectedRange())
    const block = this.document.getBlockAtPosition(endPosition)
    this.removeCurrentAttribute(block.getLastAttribute())
    return this.setSelection(startPosition)
  }

  insertPlaceholder() {
    this.placeholderPosition = this.getPosition()
    return this.insertString(PLACEHOLDER)
  }

  selectPlaceholder() {
    if (this.placeholderPosition != null) {
      this.setSelectedRange([ this.placeholderPosition, this.placeholderPosition + PLACEHOLDER.length ])
      return this.getSelectedRange()
    }
  }

  forgetPlaceholder() {
    this.placeholderPosition = null
  }

  // Current attributes

  hasCurrentAttribute(attributeName) {
    const value = this.currentAttributes[attributeName]
    return value != null && value !== false
  }

  toggleCurrentAttribute(attributeName) {
    const value = !this.currentAttributes[attributeName]
    if (value) {
      return this.setCurrentAttribute(attributeName, value)
    } else {
      return this.removeCurrentAttribute(attributeName)
    }
  }

  canSetCurrentAttribute(attributeName) {
    if (getBlockConfig(attributeName)) {
      return this.canSetCurrentBlockAttribute(attributeName)
    } else {
      return this.canSetCurrentTextAttribute(attributeName)
    }
  }

  canSetCurrentTextAttribute(attributeName) {
    const document = this.getSelectedDocument()
    if (!document) return
    for (const attachment of Array.from(document.getAttachments())) {
      if (!attachment.hasContent()) {
        return false
      }
    }
    return true
  }

  canSetCurrentBlockAttribute(attributeName) {
    const block = this.getBlock()
    if (!block) return
    return !block.isTerminalBlock()
  }

  setCurrentAttribute(attributeName, value) {
    if (getBlockConfig(attributeName)) {
      return this.setBlockAttribute(attributeName, value)
    } else {
      this.setTextAttribute(attributeName, value)
      this.currentAttributes[attributeName] = value
      return this.notifyDelegateOfCurrentAttributesChange()
    }
  }

  setTextAttribute(attributeName, value) {
    const selectedRange = this.getSelectedRange()
    if (!selectedRange) return

    const [ startPosition, endPosition ] = Array.from(selectedRange)
    if (startPosition === endPosition) {
      if (attributeName === "href") {
        const text = Text.textForStringWithAttributes(value, { href: value })
        return this.insertText(text)
      }
    } else {
      return this.setDocument(this.document.addAttributeAtRange(attributeName, value, selectedRange))
    }
  }

  setBlockAttribute(attributeName, value) {
    const selectedRange = this.getSelectedRange()
    if (this.canSetCurrentAttribute(attributeName)) {
      this.setDocument(this.document.applyBlockAttributeAtRange(attributeName, value, selectedRange))
      return this.setSelection(selectedRange)
    }
  }

  removeCurrentAttribute(attributeName) {
    if (getBlockConfig(attributeName)) {
      this.removeBlockAttribute(attributeName)
      return this.updateCurrentAttributes()
    } else {
      this.removeTextAttribute(attributeName)
      delete this.currentAttributes[attributeName]
      return this.notifyDelegateOfCurrentAttributesChange()
    }
  }

  removeTextAttribute(attributeName) {
    const selectedRange = this.getSelectedRange()
    if (!selectedRange) return
    return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange))
  }

  removeBlockAttribute(attributeName) {
    const selectedRange = this.getSelectedRange()
    if (!selectedRange) return
    return this.setDocument(this.document.removeAttributeAtRange(attributeName, selectedRange))
  }

  canDecreaseNestingLevel() {
    return this.getBlock()?.getNestingLevel() > 0
  }

  canIncreaseNestingLevel() {
    const block = this.getBlock()
    if (!block) return
    if (getBlockConfig(block.getLastNestableAttribute())?.listAttribute) {
      const previousBlock = this.getPreviousBlock()
      if (previousBlock) {
        return arrayStartsWith(previousBlock.getListItemAttributes(), block.getListItemAttributes())
      }
    } else {
      return block.getNestingLevel() > 0
    }
  }

  decreaseNestingLevel() {
    const block = this.getBlock()
    if (!block) return
    return this.setDocument(this.document.replaceBlock(block, block.decreaseNestingLevel()))
  }

  increaseNestingLevel() {
    const block = this.getBlock()
    if (!block) return
    return this.setDocument(this.document.replaceBlock(block, block.increaseNestingLevel()))
  }

  canDecreaseBlockAttributeLevel() {
    return this.getBlock()?.getAttributeLevel() > 0
  }

  decreaseBlockAttributeLevel() {
    const attribute = this.getBlock()?.getLastAttribute()
    if (attribute) {
      return this.removeCurrentAttribute(attribute)
    }
  }

  decreaseListLevel() {
    let [ startPosition ] = Array.from(this.getSelectedRange())
    const { index } = this.document.locationFromPosition(startPosition)
    let endIndex = index
    const attributeLevel = this.getBlock().getAttributeLevel()

    let block = this.document.getBlockAtIndex(endIndex + 1)
    while (block) {
      if (!block.isListItem() || block.getAttributeLevel() <= attributeLevel) {
        break
      }
      endIndex++
      block = this.document.getBlockAtIndex(endIndex + 1)
    }

    startPosition = this.document.positionFromLocation({ index, offset: 0 })
    const endPosition = this.document.positionFromLocation({ index: endIndex, offset: 0 })
    return this.setDocument(this.document.removeLastListAttributeAtRange([ startPosition, endPosition ]))
  }

  updateCurrentAttributes() {
    const selectedRange = this.getSelectedRange({ ignoreLock: true })
    if (selectedRange) {
      const currentAttributes = this.document.getCommonAttributesAtRange(selectedRange)

      Array.from(getAllAttributeNames()).forEach((attributeName) => {
        if (!currentAttributes[attributeName]) {
          if (!this.canSetCurrentAttribute(attributeName)) {
            currentAttributes[attributeName] = false
          }
        }
      })

      if (!objectsAreEqual(currentAttributes, this.currentAttributes)) {
        this.currentAttributes = currentAttributes
        return this.notifyDelegateOfCurrentAttributesChange()
      }
    }
  }

  getCurrentAttributes() {
    return extend.call({}, this.currentAttributes)
  }

  getCurrentTextAttributes() {
    const attributes = {}
    for (const key in this.currentAttributes) {
      const value = this.currentAttributes[key]
      if (value !== false) {
        if (getTextConfig(key)) {
          attributes[key] = value
        }
      }
    }
    return attributes
  }

  // Selection freezing

  freezeSelection() {
    return this.setCurrentAttribute("frozen", true)
  }

  thawSelection() {
    return this.removeCurrentAttribute("frozen")
  }

  hasFrozenSelection() {
    return this.hasCurrentAttribute("frozen")
  }

  setSelection(selectedRange) {
    const locationRange = this.document.locationRangeFromRange(selectedRange)
    return this.delegate?.compositionDidRequestChangingSelectionToLocationRange(locationRange)
  }

  getSelectedRange() {
    const locationRange = this.getLocationRange()
    if (locationRange) {
      return this.document.rangeFromLocationRange(locationRange)
    }
  }

  setSelectedRange(selectedRange) {
    const locationRange = this.document.locationRangeFromRange(selectedRange)
    return this.getSelectionManager().setLocationRange(locationRange)
  }

  getPosition() {
    const locationRange = this.getLocationRange()
    if (locationRange) {
      return this.document.positionFromLocation(locationRange[0])
    }
  }

  getLocationRange(options) {
    if (this.targetLocationRange) {
      return this.targetLocationRange
    } else {
      return this.getSelectionManager().getLocationRange(options) || normalizeRange({ index: 0, offset: 0 })
    }
  }

  withTargetLocationRange(locationRange, fn) {
    let result
    this.targetLocationRange = locationRange
    try {
      result = fn()
    } finally {
      this.targetLocationRange = null
    }
    return result
  }

  withTargetRange(range, fn) {
    const locationRange = this.document.locationRangeFromRange(range)
    return this.withTargetLocationRange(locationRange, fn)
  }

  withTargetDOMRange(domRange, fn) {
    const locationRange = this.createLocationRangeFromDOMRange(domRange, { strict: false })
    return this.withTargetLocationRange(locationRange, fn)
  }

  getExpandedRangeInDirection(direction, { length } = {}) {
    let [ startPosition, endPosition ] = Array.from(this.getSelectedRange())
    if (direction === "backward") {
      if (length) {
        startPosition -= length
      } else {
        startPosition = this.translateUTF16PositionFromOffset(startPosition, -1)
      }
    } else {
      if (length) {
        endPosition += length
      } else {
        endPosition = this.translateUTF16PositionFromOffset(endPosition, 1)
      }
    }
    return normalizeRange([ startPosition, endPosition ])
  }

  shouldManageMovingCursorInDirection(direction) {
    if (this.editingAttachment) {
      return true
    }
    const range = this.getExpandedRangeInDirection(direction)
    return this.getAttachmentAtRange(range) != null
  }

  moveCursorInDirection(direction) {
    let canEditAttachment, range
    if (this.editingAttachment) {
      range = this.document.getRangeOfAttachment(this.editingAttachment)
    } else {
      const selectedRange = this.getSelectedRange()
      range = this.getExpandedRangeInDirection(direction)
      canEditAttachment = !rangesAreEqual(selectedRange, range)
    }

    if (direction === "backward") {
      this.setSelectedRange(range[0])
    } else {
      this.setSelectedRange(range[1])
    }

    if (canEditAttachment) {
      const attachment = this.getAttachmentAtRange(range)
      if (attachment) {
        return this.editAttachment(attachment)
      }
    }
  }

  expandSelectionInDirection(direction, { length } = {}) {
    const range = this.getExpandedRangeInDirection(direction, { length })
    return this.setSelectedRange(range)
  }

  expandSelectionForEditing() {
    if (this.hasCurrentAttribute("href")) {
      return this.expandSelectionAroundCommonAttribute("href")
    }
  }

  expandSelectionAroundCommonAttribute(attributeName) {
    const position = this.getPosition()
    const range = this.document.getRangeOfCommonAttributeAtPosition(attributeName, position)
    return this.setSelectedRange(range)
  }

  selectionContainsAttachments() {
    return this.getSelectedAttachments()?.length > 0
  }

  selectionIsInCursorTarget() {
    return this.editingAttachment || this.positionIsCursorTarget(this.getPosition())
  }

  positionIsCursorTarget(position) {
    const location = this.document.locationFromPosition(position)
    if (location) {
      return this.locationIsCursorTarget(location)
    }
  }

  positionIsBlockBreak(position) {
    return this.document.getPieceAtPosition(position)?.isBlockBreak()
  }

  getSelectedDocument() {
    const selectedRange = this.getSelectedRange()
    if (selectedRange) {
      return this.document.getDocumentAtRange(selectedRange)
    }
  }

  getSelectedAttachments() {
    return this.getSelectedDocument()?.getAttachments()
  }

  // Attachments

  getAttachments() {
    return this.attachments.slice(0)
  }

  refreshAttachments() {
    const attachments = this.document.getAttachments()
    const { added, removed } = summarizeArrayChange(this.attachments, attachments)
    this.attachments = attachments

    Array.from(removed).forEach((attachment) => {
      attachment.delegate = null
      this.delegate?.compositionDidRemoveAttachment?.(attachment)
    })

    return (() => {
      const result = []

      Array.from(added).forEach((attachment) => {
        attachment.delegate = this
        result.push(this.delegate?.compositionDidAddAttachment?.(attachment))
      })

      return result
    })()
  }

  // Attachment delegate

  attachmentDidChangeAttributes(attachment) {
    this.revision++
    return this.delegate?.compositionDidEditAttachment?.(attachment)
  }

  attachmentDidChangePreviewURL(attachment) {
    this.revision++
    return this.delegate?.compositionDidChangeAttachmentPreviewURL?.(attachment)
  }

  // Attachment editing

  editAttachment(attachment, options) {
    if (attachment === this.editingAttachment) return
    this.stopEditingAttachment()
    this.editingAttachment = attachment
    return this.delegate?.compositionDidStartEditingAttachment?.(this.editingAttachment, options)
  }

  stopEditingAttachment() {
    if (!this.editingAttachment) return
    this.delegate?.compositionDidStopEditingAttachment?.(this.editingAttachment)
    this.editingAttachment = null
  }

  updateAttributesForAttachment(attributes, attachment) {
    return this.setDocument(this.document.updateAttributesForAttachment(attributes, attachment))
  }

  removeAttributeForAttachment(attribute, attachment) {
    return this.setDocument(this.document.removeAttributeForAttachment(attribute, attachment))
  }

  // Private

  breakFormattedBlock(insertion) {
    let { document } = insertion
    const { block } = insertion
    let position = insertion.startPosition
    let range = [ position - 1, position ]

    if (block.getBlockBreakPosition() === insertion.startLocation.offset) {
      if (block.breaksOnReturn() && insertion.nextCharacter === "\n") {
        position += 1
      } else {
        document = document.removeTextAtRange(range)
      }
      range = [ position, position ]
    } else if (insertion.nextCharacter === "\n") {
      if (insertion.previousCharacter === "\n") {
        range = [ position - 1, position + 1 ]
      } else {
        range = [ position, position + 1 ]
        position += 1
      }
    } else if (insertion.startLocation.offset - 1 !== 0) {
      position += 1
    }

    const newDocument = new Document([ block.removeLastAttribute().copyWithoutText() ])
    this.setDocument(document.insertDocumentAtRange(newDocument, range))
    return this.setSelection(position)
  }

  getPreviousBlock() {
    const locationRange = this.getLocationRange()
    if (locationRange) {
      const { index } = locationRange[0]
      if (index > 0) {
        return this.document.getBlockAtIndex(index - 1)
      }
    }
  }

  getBlock() {
    const locationRange = this.getLocationRange()
    if (locationRange) {
      return this.document.getBlockAtIndex(locationRange[0].index)
    }
  }

  getAttachmentAtRange(range) {
    const document = this.document.getDocumentAtRange(range)
    if (document.toString() === `${OBJECT_REPLACEMENT_CHARACTER}\n`) {
      return document.getAttachments()[0]
    }
  }

  notifyDelegateOfCurrentAttributesChange() {
    return this.delegate?.compositionDidChangeCurrentAttributes?.(this.currentAttributes)
  }

  notifyDelegateOfInsertionAtRange(range) {
    return this.delegate?.compositionDidPerformInsertionAtRange?.(range)
  }

  translateUTF16PositionFromOffset(position, offset) {
    const utf16string = this.document.toUTF16String()
    const utf16position = utf16string.offsetFromUCS2Offset(position)
    return utf16string.offsetToUCS2Offset(utf16position + offset)
  }
}

Composition.proxyMethod("getSelectionManager().getPointRange")
Composition.proxyMethod("getSelectionManager().setLocationRangeFromPointRange")
Composition.proxyMethod("getSelectionManager().createLocationRangeFromDOMRange")
Composition.proxyMethod("getSelectionManager().locationIsCursorTarget")
Composition.proxyMethod("getSelectionManager().selectionIsExpanded")
Composition.proxyMethod("delegate?.getSelectionManager")
