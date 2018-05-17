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
    if @hasAttribute(attribute)
      unless @attachment.hasAttribute(attribute)
        @attachment.setAttributes(@attributes.slice(attribute))
      @attributes = @attributes.remove(attribute)

  getValue: ->
    @attachment

  isSerializable: ->
    not @attachment.isPending()

  getCaption: ->
    @attributes.get("caption") ? ""

  getCols: ->
    @attributes.get("cols")

  getAttributesForAttachment: ->
    @attributes.slice(["caption", "cols"])

  canBeGrouped: ->
    @hasAttribute("cols") and @attachment.isPreviewable()

  canBeGroupedWith: (piece) ->
    @getAttribute("cols") is piece.getAttribute("cols")

  isEqualTo: (piece) ->
    super and @attachment.id is piece?.attachment?.id

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
