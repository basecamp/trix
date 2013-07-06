#= require trix/document
#= require trix/layout

class Trix.Composition
  constructor: ->
    @document = new Trix.Document
    @layout = new Trix.Layout @document
    @layout.delegate = this

  getPositionAtRowAndColumn: (row, column) ->
    @layout.getPositionAtRowAndColumn row, column

  getRowAndColumnAtPosition: (position) ->
    @layout.getRowAndColumnAtPosition position

  getLineAtRow: (row) ->
    @layout.getLineAtRow row

  getLines: ->
    @layout.getLines()

  setCaretPosition: (caretPosition) ->
    previousCaretPosition = @caretPosition
    @caretPosition = Math.min @document.length, Math.max 0, caretPosition
    if @caretPosition isnt previousCaretPosition
      @delegate?.compositionCaretPositionChanged this, caretPosition, previousCaretPosition

  adjustCaretPosition: (byLength) ->
    @setCaretPosition @caretPosition + byLength

  moveBackward: ->
    @adjustCaretPosition -1

  moveForward: ->
    @adjustCaretPosition 1

  deleteBackward: ->
    @document.deleteObject @caretPosition - 1
    @moveBackward()

  insertText: (text) ->
    insertedText = @document.insertText text, @caretPosition
    @adjustCaretPosition insertedText.length

  layoutLineModifiedAtRow: (layout, row) ->
    @delegate?.compositionLineModifiedAtRow this, row, @getLineAtRow row

  layoutLineInsertedAtRow: (layout, row) ->
    @delegate?.compositionLineInsertedAtRow this, row, @getLineAtRow row

  layoutLineDeletedAtRow: (layout, row) ->
    @delegate?.compositionLineDeletedAtRow this, row
