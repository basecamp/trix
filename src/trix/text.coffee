#= require trix/piece
#= require trix/attachment_piece
#= require trix/piece_list

class Trix.Text
  constructor: (source = "", attributes) ->
    @editDepth = 0
    if Array.isArray(source)
      @pieceList = new Trix.PieceList source
    else
      piece = new Trix.Piece source, attributes
      @pieceList = new Trix.PieceList [piece]

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

  insertAttachmentAtPosition: edit (attachment, attributes, position) ->
    attachmentPiece = new Trix.AttachmentPiece(attachment, attributes)
    pieceList = new Trix.PieceList([attachmentPiece])
    @pieceList.insertPieceListAtPosition(pieceList, position)

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

  getTextAtRange: (range) ->
    new @constructor @pieceList.getPieceListInRange(range).toArray()

  getStringAtRange: (range) ->
    @pieceList.getPieceListInRange(range).toString()

  endsWith: (string) ->
    if end = @pieceList.getLastPiece()?.toString()
      ///#{string}$///.test(end)

  eachRun: (callback) ->
    position = 0
    @pieceList.eachPiece (piece) ->
      attributes = piece.getAttributes()
      run = {attributes, position}

      if piece instanceof Trix.AttachmentPiece
        run.attachment = piece.attachment
      else
        run.string = piece.toString()

      callback(run)
      position += piece.length

  inspect: ->
    @pieceList.inspect()
