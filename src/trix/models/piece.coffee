#= require trix/hash

class Trix.Piece
  id = 0
  objectReplacementCharacter = "\uFFFC"

  @forAttachment: (attachment, attributes) ->
    piece = new this objectReplacementCharacter, attributes
    piece.attachment = attachment
    piece

  constructor: (@string, attributes = {}) ->
    @id = ++id
    @attributes = Trix.Hash.box(attributes)
    @length = @string.length

  copyWithAttributes: (attributes) ->
    piece = new Trix.Piece @string, attributes
    piece.attachment = @attachment
    piece

  copyWithAdditionalAttributes: (attributes) ->
    @copyWithAttributes(@attributes.merge(attributes))

  copyWithoutAttribute: (attribute) ->
    @copyWithAttributes(@attributes.remove(attribute))

  getAttributesHash: ->
    @attributes

  getAttributes: ->
    @attributes.toObject()

  getCommonAttributes: ->
    return {} unless piece = pieceList.getPieceAtIndex(0)
    attributes = piece.attributes
    keys = attributes.getKeys()

    pieceList.eachPiece (piece) ->
      keys = attributes.getKeysCommonToHash(piece.attributes)
      attributes = attributes.slice(keys)

    attributes.toObject()

  isSameKindAsPiece: (piece) ->
    piece? and @constructor is piece.constructor

  hasSameStringAsPiece: (piece) ->
    piece? and @string is piece.string

  hasSameAttributesAsPiece: (piece) ->
    piece? and (@attributes is piece.attributes or @attributes.isEqualTo(piece.attributes))

  canBeConsolidatedWithPiece: (piece) ->
    piece? and not (@attachment or piece.attachment) and @hasSameAttributesAsPiece(piece)

  isEqualTo: (piece) ->
    this is piece or (
      @isSameKindAsPiece(piece) and
      @hasSameStringAsPiece(piece) and
      @hasSameAttributesAsPiece(piece)
    )

  append: (piece) ->
    new Trix.Piece @string + piece, @attributes

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @length
      left = this
      right = null
    else
      left = new Trix.Piece @string.slice(0, offset), @attributes
      right = new Trix.Piece @string.slice(offset), @attributes
    [left, right]

  toString: ->
    @string

  toJSON: ->
    attributes = @getAttributes()

    if @attachment
      {attributes, @attachment}
    else
      {attributes, @string}

  inspect: ->
    "#<Piece string=#{JSON.stringify(@string)}, attributes=#{@attributes.inspect()}>"
