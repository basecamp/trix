module "Trix.Block"

test "consolidating blocks creates text with one blockBreak piece", ->
  blockA = new Trix.Block Trix.Text.textForStringWithAttributes("a")
  blockB = new Trix.Block Trix.Text.textForStringWithAttributes("b")
  consolidatedBlock = blockA.consolidateWith(blockB)
  pieces = consolidatedBlock.text.getPieces()

  equal pieces.length, 2, JSON.stringify(pieces)
  deepEqual pieces[0].getAttributes(), {}
  deepEqual pieces[1].getAttributes(), { blockBreak: true }
  equal consolidatedBlock.toString(), "a\nb\n"

test "consolidating empty blocks creates text with one blockBreak piece", ->
  consolidatedBlock = new Trix.Block().consolidateWith(new Trix.Block)
  pieces = consolidatedBlock.text.getPieces()

  equal pieces.length, 2, JSON.stringify(pieces)
  deepEqual pieces[0].getAttributes(), {}
  deepEqual pieces[1].getAttributes(), { blockBreak: true }
  equal consolidatedBlock.toString(), "\n\n"
