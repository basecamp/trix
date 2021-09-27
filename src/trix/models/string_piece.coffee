import Trix from "trix/global"
import Piece from "trix/models/piece"

import { normalizeNewlines } from "trix/core/helpers"

export default class StringPiece extends Piece
  @fromJSON: (pieceJSON) ->
    new this pieceJSON.string, pieceJSON.attributes

  constructor: (string) ->
    super(arguments...)
    @string = normalizeNewlines(string)
    @length = @string.length

  getValue: ->
    @string

  toString: ->
    @string.toString()

  isBlockBreak: ->
    @toString() is "\n" and @getAttribute("blockBreak") is true

  toJSON: ->
    result = super.toJSON(arguments...)
    result.string = @string
    result

  # Splittable

  canBeConsolidatedWith: (piece) ->
    piece? and @hasSameConstructorAs(piece) and @hasSameAttributesAsPiece(piece)

  consolidateWith: (piece) ->
    new @constructor @toString() + piece.toString(), @attributes

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

  toConsole: ->
    string = @string
    string = string.slice(0, 14) + "…" if string.length > 15
    JSON.stringify(string.toString())

Piece.registerType "string", StringPiece
