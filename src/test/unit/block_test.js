/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Text from "trix/models/text";
import Block from "trix/models/block";

import { assert, test, testGroup } from "test/test_helper";

testGroup("Block", function() {
  test("consolidating blocks creates text with one blockBreak piece", function() {
    const blockA = new Block(Text.textForStringWithAttributes("a"));
    const blockB = new Block(Text.textForStringWithAttributes("b"));
    const consolidatedBlock = blockA.consolidateWith(blockB);
    const pieces = consolidatedBlock.text.getPieces();

    assert.equal(pieces.length, 2, JSON.stringify(pieces));
    assert.deepEqual(pieces[0].getAttributes(), {});
    assert.deepEqual(pieces[1].getAttributes(), { blockBreak: true });
    return assert.equal(consolidatedBlock.toString(), "a\nb\n");
  });

  return test("consolidating empty blocks creates text with one blockBreak piece", function() {
    const consolidatedBlock = new Block().consolidateWith(new Block);
    const pieces = consolidatedBlock.text.getPieces();

    assert.equal(pieces.length, 2, JSON.stringify(pieces));
    assert.deepEqual(pieces[0].getAttributes(), {});
    assert.deepEqual(pieces[1].getAttributes(), { blockBreak: true });
    return assert.equal(consolidatedBlock.toString(), "\n\n");
  });
});
