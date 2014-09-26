#= require trix/models/attachment
#= require trix/models/piece

Trix.Piece.registerType "attachment", class Trix.AttachmentPiece extends Trix.Piece
  objectReplacementCharacter = "\uFFFC"

  @fromJSON: (pieceJSON) ->
    new this new Trix.Attachment, pieceJSON.attributes

  constructor: ->
    super
    @attachment = @value
    if not @attachment.isImage() and url = @attachment.getURL()
      @attributes = @attributes.add("href", url)

  isSerializable: ->
    not @attachment.isPending()

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  toString: ->
    objectReplacementCharacter
