#= require trix/views/piece_view

class Trix.TextView extends Trix.ObjectView
  constructor: ->
    super
    @text = @object

  createNodes: ->
    nodes = []
    pieces = (piece for piece in @text.getPieces() when not piece.hasAttribute("blockBreak"))
    objects = Trix.ObjectGroup.groupObjects(pieces)
    for object in objects
      view = @findOrCreateCachedChildView(Trix.PieceView, object)
      nodes.push(view.getNodes()...)
    nodes
