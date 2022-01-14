if (!window.JST) window.JST = {}

window.JST["trix/inspector/templates/document"] = function() {
  const details = this.document.getBlocks().map((block, index) => {
    const { text } = block
    const pieces = text.pieceList.toArray()

    return `<details class="block">
      <summary class="title">
        Block ${block.id}, Index: ${index}
      </summary>
      <div class="attributes">
        Attributes: ${JSON.stringify(block.attributes)}
      </div>

      <div class="text">
        <div class="title">
          Text: ${text.id}, Pieces: ${pieces.length}, Length: ${text.getLength()}
        </div>
        <div class="pieces">
          ${piecePartials(pieces).join("\n")}
        </div>
      </div>
    </details>`
  })

  return details.join("\n")
}

const piecePartials = (pieces) =>
  pieces.map((piece, index) =>`<div class="piece">
      <div class="title">
        Piece ${piece.id}, Index: ${index}
      </div>
      <div class="attributes">
        Attributes: ${JSON.stringify(piece.attributes)}
      </div>
      <div class="content">
        ${JSON.stringify(piece.toString())}
      </div>
    </div>`)
