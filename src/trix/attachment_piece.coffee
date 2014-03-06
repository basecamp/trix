#= require trix/piece

class Trix.AttachmentPiece extends Trix.Piece
  objectReplacementCharacter = "\uFFFC"

  constructor: (attributes, pieceAttributes) ->
    @attachment = attributes
    super(objectReplacementCharacter, pieceAttributes)

  canBeConsolidatedWithPiece: (piece) ->
    false
