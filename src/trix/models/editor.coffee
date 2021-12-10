import Document from "trix/models/document"
import HTMLParser from "trix/models/html_parser"

import UndoManager from "trix/models/undo_manager"
import { attachmentGalleryFilter } from "trix/filters/attachment_gallery_filter"
DEFAULT_FILTERS = [ attachmentGalleryFilter ]

export default class Editor
  constructor: (composition, selectionManager, element) ->
    @composition = composition
    @selectionManager = selectionManager
    @element = element
    @undoManager = new UndoManager @composition
    @filters = DEFAULT_FILTERS.slice(0)

  loadDocument: (document) ->
    @loadSnapshot({document, selectedRange: [0, 0]})

  loadHTML: (html = "") ->
    document = HTMLParser.parse(html, referenceElement: @element).getDocument()
    @loadDocument(document)

  loadJSON: ({document, selectedRange}) ->
    document = Document.fromJSON(document)
    @loadSnapshot({document, selectedRange})

  loadSnapshot: (snapshot) ->
    @undoManager = new UndoManager @composition
    @composition.loadSnapshot(snapshot)

  getDocument: ->
    @composition.document

  getSelectedDocument: ->
    @composition.getSelectedDocument()

  getSnapshot: ->
    @composition.getSnapshot()

  toJSON: ->
    @getSnapshot()

  # Document manipulation

  deleteInDirection: (direction) ->
    @composition.deleteInDirection(direction)

  insertAttachment: (attachment) ->
    @composition.insertAttachment(attachment)

  insertAttachments: (attachments) ->
    @composition.insertAttachments(attachments)

  insertDocument: (document) ->
    @composition.insertDocument(document)

  insertFile: (file) ->
    @composition.insertFile(file)

  insertFiles: (files) =>
    @composition.insertFiles(files)

  insertHTML: (html) ->
    @composition.insertHTML(html)

  insertString: (string) ->
    @composition.insertString(string)

  insertText: (text) ->
    @composition.insertText(text)

  insertLineBreak: ->
    @composition.insertLineBreak()

  # Selection

  getSelectedRange: ->
    @composition.getSelectedRange()

  getPosition: ->
    @composition.getPosition()

  getClientRectAtPosition: (position) ->
    locationRange = @getDocument().locationRangeFromRange([position, position + 1])
    @selectionManager.getClientRectAtLocationRange(locationRange)

  expandSelectionInDirection: (direction) ->
    @composition.expandSelectionInDirection(direction)

  moveCursorInDirection: (direction) ->
    @composition.moveCursorInDirection(direction)

  setSelectedRange: (selectedRange) ->
    @composition.setSelectedRange(selectedRange)

  # Attributes

  activateAttribute: (name, value = true) ->
    @composition.setCurrentAttribute(name, value)

  attributeIsActive: (name) ->
    @composition.hasCurrentAttribute(name)

  canActivateAttribute: (name) ->
    @composition.canSetCurrentAttribute(name)

  deactivateAttribute: (name) ->
    @composition.removeCurrentAttribute(name)

  # Nesting level

  canDecreaseNestingLevel: ->
    @composition.canDecreaseNestingLevel()

  canIncreaseNestingLevel: ->
    @composition.canIncreaseNestingLevel()

  decreaseNestingLevel: ->
    if @canDecreaseNestingLevel()
      @composition.decreaseNestingLevel()

  increaseNestingLevel: ->
    if @canIncreaseNestingLevel()
      @composition.increaseNestingLevel()

  # Undo/redo

  canRedo: ->
    @undoManager.canRedo()

  canUndo: ->
    @undoManager.canUndo()

  recordUndoEntry: (description, {context, consolidatable} = {}) ->
    @undoManager.recordUndoEntry(description, {context, consolidatable})

  redo: ->
    if @canRedo()
      @undoManager.redo()

  undo: ->
    if @canUndo()
      @undoManager.undo()
