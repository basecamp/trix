window.JST ||= {}

window.JST["trix/inspector/templates/document"] = () ->
  details = @document.getBlocks().map (block, index) =>
    { text } = block

    """
    <details class="block">
      <summary class="title">
        Block #{block.id}, Index: #{index}
      </summary>
      <div class="attributes">
        Attributes: #{JSON.stringify(block.attributes)}
      </div>

      <div class="text">
        <div class="title">
          Text: #{text.id}, Pieces: #{pieces.length}, Length: #{text.getLength()}
        </div>
        <div class="pieces">
          #{ pieces(text.pieceList.toArray()).join("\n") }
        </div>
      </div>
    </details>
    """

  details.join("\n")

pieces = () ->
  for piece, index in pieces
    """
    <div class="piece">
      <div class="title">
        Piece #{ piece.id }, Index: #{ index }
      </div>
      <div class="attributes">
        Attributes: #{ JSON.stringify(piece.attributes) }
      </div>
      <div class="content">
        #{ JSON.stringify(piece.toString()) }
      </div>
    </div>
    """
