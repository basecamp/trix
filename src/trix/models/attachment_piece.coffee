#= require trix/models/attachment
#= require trix/models/piece

Trix.Piece.registerType "attachment", class Trix.AttachmentPiece extends Trix.Piece
  @OBJECT_REPLACEMENT_CHARACTER: "\uFFFC"

  @fromJSON: (pieceJSON) ->
    new this Trix.Attachment.fromJSON(pieceJSON.attachment), pieceJSON.attributes

  constructor: (@attachment) ->
    super
    @length = 1
    if not @attachment.isImage() and url = @attachment.getURL()
      @attributes = @attributes.add("href", url)

  getValue: ->
    @attachment

  isSerializable: ->
    not @attachment.isPending()

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  toString: ->
    @constructor.OBJECT_REPLACEMENT_CHARACTER

  toJSON: ->
    json = super
    json.attachment = @attachment
    json

  toKey: ->
    [super, @attachment.toKey()].join("/")

  toConsole: ->
    JSON.stringify(@toString())
