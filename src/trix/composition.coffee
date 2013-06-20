#= require trix/document
#= require trix/layout

class Trix.Composition
  constructor: (@delegate) ->
    @document = new Trix.Document
    @layout = new Trix.Layout @document
    @layout.delegate = this

  deleteBackward: ->
    @document.deleteObject @position - 1
    @adjustPosition -1

  insertText: (text) ->
    insertedText = @document.insertText text, @position
    @adjustPosition insertedText.length

  getLine: (index) ->
    @layout.getLine index

  getLines: ->
    @layout.getLines()

  setPosition: (position) ->
    previousPosition = @position
    @position = Math.max 0, position
    if @position isnt previousPosition
      @delegate.compositionPositionChanged this, position, previousPosition

  adjustPosition: (length) ->
    @setPosition @position + length

  layoutLineModifiedAtIndex: (layout, lineIndex) ->
    @delegate.compositionLineModifiedAtIndex this, lineIndex, @getLine lineIndex

  layoutLineInsertedAtIndex: (layout, lineIndex) ->
    @delegate.compositionLineInsertedAtIndex this, lineIndex, @getLine lineIndex

  layoutLineDeletedAtIndex: (layout, lineIndex) ->
    @delegate.compositionLineDeletedAtIndex this, lineIndex
