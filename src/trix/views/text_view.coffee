import Trix from "trix/global"
import ObjectView from "trix/views/object_view"
import ObjectGroup from "trix/core/collections/object_group"
import PieceView from "trix/views/piece_view"

export default class TextView extends ObjectView
  constructor: ->
    super(arguments...)
    @text = @object
    {@textConfig} = @options

  createNodes: ->
    nodes = []
    pieces = ObjectGroup.groupObjects(@getPieces())
    lastIndex = pieces.length - 1

    for piece, index in pieces
      context = {}
      context.isFirst = true if index is 0
      context.isLast = true if index is lastIndex
      context.followsWhitespace = true if endsWithWhitespace(previousPiece)

      view = @findOrCreateCachedChildView(PieceView, piece, {@textConfig, context})
      nodes.push(view.getNodes()...)

      previousPiece = piece
    nodes

  getPieces: ->
    piece for piece in @text.getPieces() when not piece.hasAttribute("blockBreak")

  endsWithWhitespace = (piece) ->
    /\s$/.test(piece?.toString())
