#= require trix/piece
#= require trix/attachment_piece
#= require trix/piece_list

class Trix.Text
  @textForAttachmentWithAttributes: (attachment, attributes) ->
    piece = new Trix.AttachmentPiece attachment, attributes
    new this [piece]

  @textForStringWithAttributes: (string, attributes) ->
    piece = new Trix.Piece string, attributes
    new this [piece]

  constructor: (pieces = []) ->
    @editDepth = 0
    @pieceList = new Trix.PieceList pieces

  edit = (fn) -> ->
    @beginEditing()
    fn.apply(this, arguments)
    @endEditing()

  beginEditing: ->
    @editDepth++
    this

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

  moveTextFromRangeToPosition: edit (range, position) ->
    return if range[0] <= position <= range[1]
    text = @getTextAtRange(range)
    length = text.getLength()
    position -= length if range[0] < position
    @removeTextAtRange(range)
    @insertTextAtPosition(text, position)

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

  getTextAtRange: (range) ->
    new @constructor @pieceList.getPieceListInRange(range).toArray()

  getStringAtRange: (range) ->
    @pieceList.getPieceListInRange(range).toString()

  getLength: ->
    @pieceList.getLength()

  isEqualTo: (text) ->
    this is text or text?.pieceList?.isEqualTo(@pieceList)

  endsWith: (string) ->
    if end = @pieceList.getLastPiece()?.toString()
      ///#{string}$///.test(end)

  eachRun: (callback) ->
    position = 0
    @pieceList.eachPiece (piece) ->
      id = piece.id
      attributes = piece.getAttributes()
      run = {id, attributes, position}

      if piece instanceof Trix.AttachmentPiece
        run.attachment = piece.attachment
      else
        run.string = piece.toString()

      callback(run)
      position += piece.length

  inspect: ->
    @pieceList.inspect()

  toString: ->
    @pieceList.toString()
