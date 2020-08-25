#= require trix/models/attachment_piece
#= require trix/models/string_piece
#= require trix/models/splittable_list

class Trix.Text extends Trix.Object
  @textForAttachmentWithAttributes: (attachment, attributes) ->
    piece = new Trix.AttachmentPiece attachment, attributes
    new this [piece]

  @textForStringWithAttributes: (string, attributes) ->
    piece = new Trix.StringPiece string, attributes
    new this [piece]

  @fromJSON: (textJSON) ->
    pieces = for pieceJSON in textJSON
      Trix.Piece.fromJSON pieceJSON
    new this pieces

  constructor: (pieces = []) ->
    super
    @pieceList = new Trix.SplittableList (piece for piece in pieces when not piece.isEmpty())

  copy: ->
    @copyWithPieceList @pieceList

  copyWithPieceList: (pieceList) ->
    new @constructor pieceList.consolidate().toArray()

  copyUsingObjectMap: (objectMap) ->
    pieces = for piece in @getPieces()
      objectMap.find(piece) ? piece
    new @constructor pieces

  appendText: (text) ->
    @insertTextAtPosition(text, @getLength())

  insertTextAtPosition: (text, position) ->
    @copyWithPieceList @pieceList.insertSplittableListAtPosition(text.pieceList, position)

  removeTextAtRange: (range) ->
    @copyWithPieceList @pieceList.removeObjectsInRange(range)

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
    @copyWithPieceList @pieceList.transformObjectsInRange range, (piece) ->
      piece.copyWithAdditionalAttributes(attributes)

  removeAttributeAtRange: (attribute, range) ->
    @copyWithPieceList @pieceList.transformObjectsInRange range, (piece) ->
      piece.copyWithoutAttribute(attribute)

  setAttributesAtRange: (attributes, range) ->
    @copyWithPieceList @pieceList.transformObjectsInRange range, (piece) ->
      piece.copyWithAttributes(attributes)

  getAttributesAtPosition: (position) ->
    @pieceList.getObjectAtPosition(position)?.getAttributes() ? {}

  getCommonAttributes: ->
    objects = (piece.getAttributes() for piece in @pieceList.toArray())
    Trix.Hash.fromCommonAttributesOfObjects(objects).toObject()

  getCommonAttributesAtRange: (range) ->
    @getTextAtRange(range).getCommonAttributes() ? {}

  getExpandedRangeForAttributeAtOffset: (attributeName, offset) ->
    left = right = offset
    length = @getLength()

    left-- while left > 0 and @getCommonAttributesAtRange([left - 1, right])[attributeName]
    right++ while right < length and @getCommonAttributesAtRange([offset, right + 1])[attributeName]

    [left, right]

  getTextAtRange: (range) ->
    @copyWithPieceList @pieceList.getSplittableListInRange(range)

  getStringAtRange: (range) ->
    @pieceList.getSplittableListInRange(range).toString()

  getStringAtPosition: (position) ->
    @getStringAtRange([position, position + 1])

  startsWithString: (string) ->
    @getStringAtRange([0, string.length]) is string

  endsWithString: (string) ->
    length = @getLength()
    @getStringAtRange([length - string.length, length]) is string

  getAttachmentPieces: ->
    piece for piece in @pieceList.toArray() when piece.attachment?

  getAttachments: ->
    piece.attachment for piece in @getAttachmentPieces()

  getAttachmentAndPositionById: (attachmentId) ->
    position = 0
    for piece in @pieceList.toArray()
      if piece.attachment?.id is attachmentId
        return { attachment: piece.attachment, position }
      position += piece.length
    attachment: null, position: null

  getAttachmentById: (attachmentId) ->
    {attachment, position} = @getAttachmentAndPositionById(attachmentId)
    attachment

  getRangeOfAttachment: (attachment) ->
    {attachment, position} = @getAttachmentAndPositionById(attachment.id)
    [position, position + 1] if attachment?

  updateAttributesForAttachment: (attributes, attachment) ->
    if range = @getRangeOfAttachment(attachment)
      @addAttributesAtRange(attributes, range)
    else
      this

  getLength: ->
    @pieceList.getEndPosition()

  isEmpty: ->
    @getLength() is 0

  isEqualTo: (text) ->
    super or text?.pieceList?.isEqualTo(@pieceList)

  isBlockBreak: ->
    @getLength() is 1 and @pieceList.getObjectAtIndex(0).isBlockBreak()

  eachPiece: (callback) ->
    @pieceList.eachObject(callback)

  getPieces: ->
    @pieceList.toArray()

  getPieceAtPosition: (position) ->
    @pieceList.getObjectAtPosition(position)

  contentsForInspection: ->
    pieceList: @pieceList.inspect()

  toSerializableText: ->
    pieceList = @pieceList.selectSplittableList (piece) -> piece.isSerializable()
    @copyWithPieceList(pieceList)

  toString: ->
    @pieceList.toString()

  toJSON: ->
    @pieceList.toJSON()

  toConsole: ->
    JSON.stringify(JSON.parse(piece.toConsole()) for piece in @pieceList.toArray())

  # BIDI

  getDirection: ->
    Trix.getDirection(@toString())

  isRTL: ->
    @getDirection() is "rtl"
