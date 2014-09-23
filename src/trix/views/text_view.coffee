#= require trix/views/piece_view

class Trix.TextView
  constructor: (@text, @options) ->

  render: ->
    @element = document.createDocumentFragment()

    position = 0
    @text.eachPiece (piece) =>
      @previousPiece = @currentPiece
      @currentPiece = piece
      parentAttribute = @getParentAttribute()
      pieceView = new Trix.PieceView piece, parentAttribute, position
      pieceElement = pieceView.render()

      if parentAttribute
        @element.lastChild.appendChild(pieceElement)
      else
        @element.appendChild(pieceElement)

      position += piece.length

    @element

  getParentAttribute: ->
    if @previousPiece
      for key, value of @currentPiece.getAttributes() when Trix.attributes[key]?.parent
        return key if value is @previousPiece.getAttributes()[key]
