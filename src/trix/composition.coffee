#= require trix/document

class Trix.Composition
  constructor: (@delegate) ->
    @document = new Trix.Document this

  deleteBackward: ->
    @document.deleteText @position - 1, 1
    @adjustPosition -1

  insertText: (text) ->
    insertedText = @document.insertText text, @position
    @adjustPosition insertedText.length

  setPosition: (position) ->
    previousPosition = @position
    @position = Math.max 0, position
    if @position isnt previousPosition
      @delegate.compositionPositionChanged this, position, previousPosition

  adjustPosition: (length) ->
    @setPosition @position + length

  documentLineModifiedAtIndex: (document, lineIndex, text, originalText) ->
    @delegate.compositionLineModifiedAtIndex this, lineIndex, text

  documentLineInsertedAtIndex: (document, lineIndex, text) ->
    @delegate.compositionLineInsertedAtIndex this, lineIndex, text

  documentLineDeletedAtIndex: (document, lineIndex) ->
    @delegate.compositionLineDeletedAtIndex this, lineIndex
