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

  getMetadata: ->
    attributes = {}
    for key in ["contentType", "filename", "filesize", "identifier"]
      attributes[key] = @attributes.get(key) if @attributes.has(key)
    attributes

  getURL: ->
    @attributes.get("url")

  getFilename: ->
    @attributes.get("filename")

  getFilesize: ->
    @attributes.get("filesize")

  getExtension: ->
    @getFilename().match(/\.(\w+)$/)?[1].toLowerCase()

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  toString: ->
    objectReplacementCharacter
