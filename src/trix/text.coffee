#= require trix/piece
#= require trix/piece_list

class Trix.Text
  constructor: (string = "", attributes) ->
    piece = new Trix.Piece string, attributes
    @pieceList = new Trix.PieceList [piece]

  edit = (fn) -> ->
    fn.apply(this, arguments)
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

  addAttributeAtRange: (attribute, value, range) ->
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
    pieceList = @pieceList.getPieceListInRange(range)
    return {} unless firstPiece = pieceList.getPieceAtIndex(0)

    firstAttributes = firstPiece.getAttributes()
    keys = Object.keys(firstAttributes)
    pieceList.removePieceAtIndex(0)

    pieceList.eachPiece (piece) ->
      attributes = piece.getAttributes()
      keys = (key for key in keys when attributes[key] is firstAttributes[key])

    attributes = {}
    attributes[key] = firstAttributes[key] for key in keys
    attributes

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
