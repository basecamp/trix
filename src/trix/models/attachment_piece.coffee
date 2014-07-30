#= require trix/models/attachment
#= require trix/models/piece

Trix.Piece.registerType "attachment", class Trix.AttachmentPiece extends Trix.Piece
  objectReplacementCharacter = "\uFFFC"

  @fromJSON: (pieceJSON) ->
    new this new Trix.Attachment, pieceJSON.attributes

  constructor: ->
    super
    @attachment = @value

  isPending: ->
    @attachment.file? and not @getURL()?

  isSerializable: ->
    not @isPending()

  isImage: ->
    /image/.test(@attributes.get("contentType"))

  getIdentifier: ->
    @attributes.get("identifier")

  hasIdentifier: ->
    @attributes.has("identifier")

  getURL: ->
    @attributes.get("url")

  getFilename: ->
    @attributes.get("filename")

  getExtension: ->
    @getFilename().match(/\.(\w+)$/)?[1]

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  toString: ->
    objectReplacementCharacter
