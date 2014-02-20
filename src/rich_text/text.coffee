#= require rich_text/piece
#= require rich_text/piece_list

class RichText.Text
  constructor: (string = "", attributes) ->
    piece = new RichText.Piece string, attributes
    @pieceList = new RichText.PieceList [piece]

  edit = (fn) -> ->
    fn.apply(this, arguments)
    @pieceList.consolidate()
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

  getLength: ->
    @pieceList.getLength()

  eachRun: (callback) ->
    position = 0
    @pieceList.eachPiece (piece) ->
      callback(piece.toString(), piece.getAttributes(), position)
      position += piece.length

  inspect: ->
    @pieceList.inspect()
