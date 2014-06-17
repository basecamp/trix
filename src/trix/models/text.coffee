#= require trix/models/piece
#= require trix/models/piece_list
#= require trix/utilities/hash

class Trix.Text
  @textForAttachmentWithAttributes: (attachment, attributes) ->
    piece = Trix.Piece.forAttachment(attachment, attributes)
    new this [piece]

  @textForStringWithAttributes: (string, attributes) ->
    piece = new Trix.Piece string, attributes
    new this [piece]

  @fromJSONString: (string) ->
    @fromJSON JSON.parse(string)

  @fromJSON: (textJSON) ->
    pieces = for pieceJSON in textJSON
      Trix.Piece.fromJSON pieceJSON
    new this pieces

  @fromHTML: (html) ->
    Trix.HTMLParser.parse(html).getText()

  constructor: (pieces = []) ->
    @pieceList = new Trix.PieceList pieces

  copy: ->
    @copyWithPieceList @pieceList

  copyWithPieceList: (pieceList) ->
    new @constructor pieceList.consolidate().toArray(), @attributes

  appendText: (text) ->
    @insertTextAtPosition(text, @getLength())

  insertTextAtPosition: (text, position) ->
    @copyWithPieceList @pieceList.insertPieceListAtPosition(text.pieceList, position)

  removeTextAtRange: (range) ->
    @copyWithPieceList @pieceList.removePiecesInRange(range)

  replaceTextAtRange: (text, range) ->
    @removeTextAtRange(range).insertTextAtPosition(text, range[0])

  moveTextFromRangeToPosition: (range, position) ->
    return if range[0] <= position <= range[1]
    text = @getTextAtRange(range)
    length = text.getLength()
    position -= length if range[0] < position
    @removeTextAtRange(range).insertTextAtPosition(text, position)

  addAttributeAtRange: (attribute, value, range) ->
    attributes = {}
    attributes[attribute] = value
    @addAttributesAtRange(attributes, range)

  addAttributesAtRange: (attributes, range) ->
    @copyWithPieceList @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithAdditionalAttributes(attributes)

  removeAttributeAtRange: (attribute, range) ->
    @copyWithPieceList @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithoutAttribute(attribute)

  setAttributesAtRange: (attributes, range) ->
    @copyWithPieceList @pieceList.transformPiecesInRange range, (piece) ->
      piece.copyWithAttributes(attributes)

  getAttributesAtPosition: (position) ->
    @pieceList.getPieceAtPosition(position)?.getAttributes() ? {}

  getCommonAttributesAtRange: (range) ->
    @pieceList.getPieceListInRange(range)?.getCommonAttributes() ? {}

  getTextAtRange: (range) ->
    @copyWithPieceList @pieceList.getPieceListInRange(range)

  getStringAtRange: (range) ->
    @pieceList.getPieceListInRange(range).toString()

  getAttachments: ->
    @pieceList.getAttachments()

  getAttachmentById: (attachmentId) ->
    {attachment, position} = @pieceList.getAttachmentAndPositionById(attachmentId)
    attachment

  getRangeOfAttachment: (attachment) ->
    {attachment, position} = @pieceList.getAttachmentAndPositionById(attachment.id)
    [position, position + 1] if attachment?

  resizeAttachmentToDimensions: (attachment, {width, height} = {}) ->
    if range = @getRangeOfAttachment(attachment)
      @addAttributesAtRange({width, height}, range)
    else
      this

  getLength: ->
    @pieceList.getLength()

  isEqualTo: (text) ->
    this is text or text?.pieceList?.isEqualTo(@pieceList)

  eachRun: (callback) ->
    position = 0
    @pieceList.eachPiece (piece) ->
      id = piece.id
      attributes = piece.getAttributes()
      run = {id, attributes, position}

      if piece.attachment
        run.attachment = piece.attachment
      else
        run.string = piece.toString()

      callback(run)
      position += piece.length

  inspect: ->
    @pieceList.inspect()

  toString: ->
    @pieceList.toString()

  toJSON: ->
    @pieceList

  asJSON: ->
    JSON.stringify(this)
