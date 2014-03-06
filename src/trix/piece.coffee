#= require trix/hash

class Trix.Piece
  constructor: (@string, attributes = {}) ->
    @attributes = Trix.Hash.box(attributes)
    @length = @string.length

  copyWithAttributes: (attributes) ->
    new Trix.Piece @string, attributes

  copyWithAdditionalAttributes: (attributes) ->
    new Trix.Piece @string, @attributes.merge(attributes)

  copyWithoutAttribute: (attribute) ->
    new Trix.Piece @string, @attributes.remove(attribute)

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

  hasSameAttributesAsPiece: (piece) ->
    @attributes is piece.attributes or @attributes.isEqualTo(piece.attributes)

  isAppendable: ->
    true

  canAppendToPiece: (piece) ->
    piece? and @isAppendable() and piece.isAppendable() and @hasSameAttributesAsPiece(piece)

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

  inspect: ->
    "#<Piece string=#{JSON.stringify(@string)}, attributes=#{@attributes.inspect()}>"
