#= require trix/utilities/object
#= require trix/utilities/hash

class Trix.Piece extends Trix.Object
  objectReplacementCharacter = "\uFFFC"

  @fromJSON: (pieceJSON) ->
    attributes = pieceJSON.attributes
    if attachmentJSON = pieceJSON.attachment
      attachment = new Trix.Attachment attachmentJSON.attributes
      attachment.setIdentifier(attachmentJSON.identifier) if attachmentJSON.identifier?
      @forAttachment attachment, attributes
    else
      new this pieceJSON.string, attributes

  @forAttachment: (attachment, attributes) ->
    piece = new this objectReplacementCharacter, attributes
    piece.attachment = attachment
    piece

  constructor: (@string, attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)
    @length = @string.length

  copyWithAttributes: (attributes) ->
    piece = new Trix.Piece @string, attributes
    piece.attachment = @attachment
    piece

  copyWithAdditionalAttributes: (attributes) ->
    @copyWithAttributes(@attributes.merge(attributes))

  copyWithoutAttribute: (attribute) ->
    @copyWithAttributes(@attributes.remove(attribute))

  copy: ->
    @copyWithAttributes(@attributes)

  getAttributesHash: ->
    @attributes

  getAttributes: ->
    @attributes.toObject()

  getCommonAttributes: ->
    return {} unless piece = pieceList.getPieceAtIndex(0)
    attributes = piece.attributes
    keys = attributes.getKeys()

    pieceList.eachPiece (piece) ->
      keys = attributes.getKeysCommonToHash(piece.attributes)
      attributes = attributes.slice(keys)

    attributes.toObject()

  hasSameStringAsPiece: (piece) ->
    piece? and @string is piece.string

  hasSameAttributesAsPiece: (piece) ->
    piece? and (@attributes is piece.attributes or @attributes.isEqualTo(piece.attributes))

  isEqualTo: (piece) ->
    super or (
      @hasSameConstructorAs(piece) and
      @hasSameStringAsPiece(piece) and
      @hasSameAttributesAsPiece(piece)
    )

  toString: ->
    @string

  toJSON: ->
    attributes = @getAttributes()

    if @attachment
      {@attachment, attributes}
    else
      {@string, attributes}

  contentsForInspection: ->
    string: JSON.stringify(@string)
    attributes: @attributes.inspect()

  # Splittable

  getLength: ->
    @length

  canBeConsolidatedWith: (piece) ->
    piece? and not (@attachment or piece.attachment) and @hasSameAttributesAsPiece(piece)

  consolidateWith: (piece) ->
    new @constructor @string + piece.string, @attributes

  splitAtOffset: (offset) ->
    if offset is 0
      left = null
      right = this
    else if offset is @length
      left = this
      right = null
    else
      left = new @constructor @string.slice(0, offset), @attributes
      right = new @constructor @string.slice(offset), @attributes
    [left, right]
