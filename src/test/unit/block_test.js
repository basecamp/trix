import { assert, test, testGroup } from "test/test_helper"

import Text from "trix/models/text"
import Block from "trix/models/block"

testGroup("Block", () => {
  test("consolidating blocks creates text with one blockBreak piece", () => {
    const blockA = new Block(Text.textForStringWithAttributes("a"))
    const blockB = new Block(Text.textForStringWithAttributes("b"))
    const consolidatedBlock = blockA.consolidateWith(blockB)
    const pieces = consolidatedBlock.text.getPieces()

    assert.equal(pieces.length, 2, JSON.stringify(pieces))
    assert.deepEqual(pieces[0].getAttributes(), {})
    assert.deepEqual(pieces[1].getAttributes(), { blockBreak: true })
    assert.equal(consolidatedBlock.toString(), "a\nb\n")
  })

  test("consolidating empty blocks creates text with one blockBreak piece", () => {
    const consolidatedBlock = new Block().consolidateWith(new Block())
    const pieces = consolidatedBlock.text.getPieces()

    assert.equal(pieces.length, 2, JSON.stringify(pieces))
    assert.deepEqual(pieces[0].getAttributes(), {})
    assert.deepEqual(pieces[1].getAttributes(), { blockBreak: true })
    assert.equal(consolidatedBlock.toString(), "\n\n")
  })
})
