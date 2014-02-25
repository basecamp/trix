#= require trix/piece
#= require trix/piece_list

class Trix.Text
  constructor: (string = "", attributes) ->
    piece = new Trix.Piece string, attributes
    @pieceList = new Trix.PieceList [piece]
    @editDepth = 0

  edit = (fn) -> ->
    @beginEditing()
    fn.apply(this, arguments)
    @endEditing()

  beginEditing: ->
    @editDepth++

  endEditing: ->
    if --@editDepth is 0
      @pieceList.consolidate()
      @delegate?.didEditText?(this)
    this

  appendText: edit (text) ->
    @insertTextAtPosition(text, @getLength())

  insertTextAtPosition: edit (text, position) ->
    @pieceList.insertPieceListAtPosition(text.pieceList, position)

  removeTextAtRange: edit (range) ->
    @pieceList.removePiecesInRange(range)

  replaceTextAtRange: edit (text, range) ->
    @removeTextAtRange(range)
    @insertTextAtPosition(text, range[0])

  addAttributeAtRange: edit (attribute, value, range) ->
    attributes = {}
    attributes[attribute] = value
    @addAttributesAtRange(attributes, range)

  addAttributesAtRange: edit (attributes, range) ->
    @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithAdditionalAttributes(attributes)

  removeAttributeAtRange: edit (attribute, range) ->
    @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithoutAttribute(attribute)

  setAttributesAtRange: edit (attributes, range) ->
    @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithAttributes(attributes)

  getAttributesAtPosition: (position) ->
    @pieceList.getPieceAtPosition(position)?.getAttributes() ? {}

  getCommonAttributesAtRange: (range) ->
    @pieceList.getPieceListInRange(range)?.getCommonAttributes() ? {}

  getLength: ->
    @pieceList.getLength()

  getStringAtRange: (range) ->
    @pieceList.getPieceListInRange(range).toString()

  eachRun: (callback) ->
    position = 0
    @pieceList.eachPiece (piece) ->
      callback(piece.toString(), piece.getAttributes(), position)
      position += piece.length

  inspect: ->
    @pieceList.inspect()
