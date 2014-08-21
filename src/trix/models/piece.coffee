#= require trix/utilities/object
#= require trix/utilities/hash

class Trix.Piece extends Trix.Object
  @types: {}

  @registerType: (type, constructor) ->
    constructor.type = type
    @types[type] = constructor

  @fromJSON: (pieceJSON) ->
    if constructor = @types[pieceJSON.type]
      constructor.fromJSON(pieceJSON)

  constructor: (@value, attributes = {}) ->
    super
    @attributes = Trix.Hash.box(attributes)
    @length = @toString().length

  copyWithAttributes: (attributes) ->
    new @constructor @value, attributes

  copyWithAdditionalAttributes: (attributes) ->
    @copyWithAttributes(@attributes.merge(attributes))

  copyWithoutAttribute: (attribute) ->
    @copyWithAttributes(@attributes.remove(attribute))

  copy: ->
    @copyWithAttributes(@attributes)

  getAttribute: (attribute) ->
    @attributes.get(attribute)

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

  hasSameStringValueAsPiece: (piece) ->
    piece? and @toString() is piece.toString()

  hasSameAttributesAsPiece: (piece) ->
    piece? and (@attributes is piece.attributes or @attributes.isEqualTo(piece.attributes))

  isEqualTo: (piece) ->
    super or (
      @hasSameConstructorAs(piece) and
      @hasSameStringValueAsPiece(piece) and
      @hasSameAttributesAsPiece(piece)
    )

  isEmpty: ->
    @length is 0

  isSerializable: ->
    true

  toString: ->
    "NO"

  toJSON: ->
    type: @constructor.type
    attributes: @getAttributes()

  toConsole: ->
    stringValue = @toString()
    stringValue = stringValue.slice(0, 14) + "…" if stringValue.length > 15
    JSON.stringify(stringValue)

  contentsForInspection: ->
    type: @constructor.type
    attributes: @attributes.inspect()

  # Splittable

  getLength: ->
    @length

  canBeConsolidatedWith: (piece) ->
    false
