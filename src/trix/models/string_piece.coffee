#= require trix/models/piece

Trix.Piece.registerType "string", class Trix.StringPiece extends Trix.Piece
  @fromJSON: (pieceJSON) ->
    new this pieceJSON.string, pieceJSON.attributes

  toString: ->
    @value

  toJSON: ->
    result = super
    result.string = @value
    result

  # Splittable

  canBeConsolidatedWith: (piece) ->
    piece? and @hasSameConstructorAs(piece) and @hasSameAttributesAsPiece(piece)

  consolidateWith: (piece) ->
    new @constructor @toString() + piece.toString(), @attributes

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @length
      left = this
      right = null
    else
      left = new @constructor @value.slice(0, offset), @attributes
      right = new @constructor @value.slice(offset), @attributes
    [left, right]
