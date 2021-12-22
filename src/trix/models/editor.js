import Document from "trix/models/document"
import HTMLParser from "trix/models/html_parser"

import UndoManager from "trix/models/undo_manager"
import { attachmentGalleryFilter } from "trix/filters/attachment_gallery_filter"
const DEFAULT_FILTERS = [ attachmentGalleryFilter ]

export default class Editor {
  constructor(composition, selectionManager, element) {
    this.insertFiles = this.insertFiles.bind(this)
    this.composition = composition
    this.selectionManager = selectionManager
    this.element = element
    this.undoManager = new UndoManager(this.composition)
    this.filters = DEFAULT_FILTERS.slice(0)
  }

  loadDocument(document) {
    return this.loadSnapshot({ document, selectedRange: [ 0, 0 ] })
  }

  loadHTML(html = "") {
    const document = HTMLParser.parse(html, { referenceElement: this.element }).getDocument()
    return this.loadDocument(document)
  }

  loadJSON({ document, selectedRange }) {
    document = Document.fromJSON(document)
    return this.loadSnapshot({ document, selectedRange })
  }

  loadSnapshot(snapshot) {
    this.undoManager = new UndoManager(this.composition)
    return this.composition.loadSnapshot(snapshot)
  }

  getDocument() {
    return this.composition.document
  }

  getSelectedDocument() {
    return this.composition.getSelectedDocument()
  }

  getSnapshot() {
    return this.composition.getSnapshot()
  }

  toJSON() {
    return this.getSnapshot()
  }

  // Document manipulation

  deleteInDirection(direction) {
    return this.composition.deleteInDirection(direction)
  }

  insertAttachment(attachment) {
    return this.composition.insertAttachment(attachment)
  }

  insertAttachments(attachments) {
    return this.composition.insertAttachments(attachments)
  }

  insertDocument(document) {
    return this.composition.insertDocument(document)
  }

  insertFile(file) {
    return this.composition.insertFile(file)
  }

  insertFiles(files) {
    return this.composition.insertFiles(files)
  }

  insertHTML(html) {
    return this.composition.insertHTML(html)
  }

  insertString(string) {
    return this.composition.insertString(string)
  }

  insertText(text) {
    return this.composition.insertText(text)
  }

  insertLineBreak() {
    return this.composition.insertLineBreak()
  }

  // Selection

  getSelectedRange() {
    return this.composition.getSelectedRange()
  }

  getPosition() {
    return this.composition.getPosition()
  }

  getClientRectAtPosition(position) {
    const locationRange = this.getDocument().locationRangeFromRange([ position, position + 1 ])
    return this.selectionManager.getClientRectAtLocationRange(locationRange)
  }

  expandSelectionInDirection(direction) {
    return this.composition.expandSelectionInDirection(direction)
  }

  moveCursorInDirection(direction) {
    return this.composition.moveCursorInDirection(direction)
  }

  setSelectedRange(selectedRange) {
    return this.composition.setSelectedRange(selectedRange)
  }

  // Attributes

  activateAttribute(name, value = true) {
    return this.composition.setCurrentAttribute(name, value)
  }

  attributeIsActive(name) {
    return this.composition.hasCurrentAttribute(name)
  }

  canActivateAttribute(name) {
    return this.composition.canSetCurrentAttribute(name)
  }

  deactivateAttribute(name) {
    return this.composition.removeCurrentAttribute(name)
  }

  // Nesting level

  canDecreaseNestingLevel() {
    return this.composition.canDecreaseNestingLevel()
  }

  canIncreaseNestingLevel() {
    return this.composition.canIncreaseNestingLevel()
  }

  decreaseNestingLevel() {
    if (this.canDecreaseNestingLevel()) {
      return this.composition.decreaseNestingLevel()
    }
  }

  increaseNestingLevel() {
    if (this.canIncreaseNestingLevel()) {
      return this.composition.increaseNestingLevel()
    }
  }

  // Undo/redo

  canRedo() {
    return this.undoManager.canRedo()
  }

  canUndo() {
    return this.undoManager.canUndo()
  }

  recordUndoEntry(description, { context, consolidatable } = {}) {
    return this.undoManager.recordUndoEntry(description, { context, consolidatable })
  }

  redo() {
    if (this.canRedo()) {
      return this.undoManager.redo()
    }
  }

  undo() {
    if (this.canUndo()) {
      return this.undoManager.undo()
    }
  }
}
