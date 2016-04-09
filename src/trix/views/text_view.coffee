#= require trix/views/piece_view

class Trix.TextView extends Trix.ObjectView
  constructor: ->
    super
    @text = @object
    {@textConfig} = @options

  createNodes: ->
    nodes = []
    pieces = Trix.ObjectGroup.groupObjects(@getPieces())
    lastIndex = pieces.length - 1

    for piece, index in pieces
      context = {}
      context.isFirst = true if index is 0
      context.isLast = true if index is lastIndex
      context.followsWhitespace = true if endsWithWhitespace(previousPiece)

      view = @findOrCreateCachedChildView(Trix.PieceView, piece, {@textConfig, context})
      nodes.push(view.getNodes()...)

      previousPiece = piece
    nodes

  getPieces: ->
    piece for piece in @text.getPieces() when not piece.hasAttribute("blockBreak")

  endsWithWhitespace = (piece) ->
    /\s$/.test(piece?.toString())
