{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.Block", ->
  test "consolidating blocks creates text with one blockBreak piece", ->
    blockA = new Trix.Block Trix.Text.textForStringWithAttributes("a")
    blockB = new Trix.Block Trix.Text.textForStringWithAttributes("b")
    consolidatedBlock = blockA.consolidateWith(blockB)
    pieces = consolidatedBlock.text.getPieces()

    assert.equal pieces.length, 2, JSON.stringify(pieces)
    assert.deepEqual pieces[0].getAttributes(), {}
    assert.deepEqual pieces[1].getAttributes(), { blockBreak: true }
    assert.equal consolidatedBlock.toString(), "a\nb\n"

  test "consolidating empty blocks creates text with one blockBreak piece", ->
    consolidatedBlock = new Trix.Block().consolidateWith(new Trix.Block)
    pieces = consolidatedBlock.text.getPieces()

    assert.equal pieces.length, 2, JSON.stringify(pieces)
    assert.deepEqual pieces[0].getAttributes(), {}
    assert.deepEqual pieces[1].getAttributes(), { blockBreak: true }
    assert.equal consolidatedBlock.toString(), "\n\n"
