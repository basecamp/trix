#= require trix/models/attachment
#= require trix/models/piece

Trix.Piece.registerType "attachment", class Trix.AttachmentPiece extends Trix.Piece
  @fromJSON: (pieceJSON) ->
    new this Trix.Attachment.fromJSON(pieceJSON.attachment), pieceJSON.attributes

  constructor: (@attachment) ->
    super
    @length = 1
    @ensureAttachmentExclusivelyHasAttribute("href")

  ensureAttachmentExclusivelyHasAttribute: (attribute) ->
    if @hasAttribute(attribute) and @attachment.hasAttribute(attribute)
      @attributes = @attributes.remove(attribute)

  getValue: ->
    @attachment

  isSerializable: ->
    not @attachment.isPending()

  getWidth: ->
    @attributes.get("width")

  getHeight: ->
    @attributes.get("height")

  canBeGrouped: ->
    super and not @attachment.hasAttribute("href")

  toString: ->
    Trix.OBJECT_REPLACEMENT_CHARACTER

  toJSON: ->
    json = super
    json.attachment = @attachment
    json

  getCacheKey: ->
    [super, @attachment.getCacheKey()].join("/")

  toConsole: ->
    JSON.stringify(@toString())
