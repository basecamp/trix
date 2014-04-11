#= require trix/models/piece

class Trix.AttachmentPiece extends Trix.Piece
  objectReplacementCharacter = "\uFFFC"

  constructor: (@attachment, pieceAttributes) ->
    super(objectReplacementCharacter, pieceAttributes)

  copyWithAttributes: (attributes) ->
    new Trix.AttachmentPiece @attachment, attributes

  canBeConsolidatedWithPiece: (piece) ->
    false

  afterRemove: ->
    Trix.Attachment.remove(@attachment)

  toJSON: ->
    attachment: @attachment
    attributes: @getAttributes()
