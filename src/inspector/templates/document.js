/* eslint-disable
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!window.JST) { window.JST = {} }

window.JST["trix/inspector/templates/document"] = function() {
  const details = this.document.getBlocks().map((block, index) => {
    const { text } = block

    return `\
<details class="block">
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
      ${ pieces(text.pieceList.toArray()).join("\n") }
    </div>
  </div>
</details>\
`
  })

  return details.join("\n")
}

var pieces = () => Array.from(pieces).map((piece, index) =>
  `\
<div class="piece">
<div class="title">
  Piece ${ piece.id }, Index: ${ index }
</div>
<div class="attributes">
  Attributes: ${ JSON.stringify(piece.attributes) }
</div>
<div class="content">
  ${ JSON.stringify(piece.toString()) }
</div>
</div>\
`)
