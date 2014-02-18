#= require rich_text/hash

class RichText.Piece
  constructor: (@string, attributes = {}) ->
    @attributes = RichText.Hash.box(attributes)
    @length = @string.length

  copyWithAttributes: (attributes) ->
    new RichText.Piece @string, attributes

  copyWithAdditionalAttributes: (attributes) ->
    new RichText.Piece @string, @attributes.merge(attributes)

  copyWithoutAttribute: (attribute) ->
    new RichText.Piece @string, @attributes.remove(attribute)

  getAttributes: ->
    @attributes.toObject()

  hasSameAttributesAsPiece: (piece) ->
    piece? and (@attributes is piece.attributes or @attributes.isEqualTo(piece.attributes))

  append: (piece) ->
    new RichText.Piece @string + piece, @attributes

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @length
      left = this
      right = null
    else
      left = new RichText.Piece @string.slice(0, offset), @attributes
      right = new RichText.Piece @string.slice(offset), @attributes
    [left, right]

  toString: ->
    @string

  inspect: ->
    "#<Piece string=#{JSON.stringify(@string)}, attributes=#{@attributes.inspect()}>"
