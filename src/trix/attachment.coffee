#= require trix/piece

class Trix.Attachment extends Trix.Piece
  objectReplacementCharacter = "\uFFFC"

  constructor: (attributes, pieceAttributes) ->
    @attachment = attributes
    super(objectReplacementCharacter, pieceAttributes)

  isAppendable: ->
    false
