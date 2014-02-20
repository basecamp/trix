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

  getAttributes: ->
    @attributes.toObject()

  hasSameAttributesAsPiece: (piece) ->
    piece? and (@attributes is piece.attributes or @attributes.isEqualTo(piece.attributes))

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
