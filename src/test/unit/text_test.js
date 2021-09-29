// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Text from "trix/models/text"
import StringPiece from "trix/models/string_piece"

import { assert, test, testGroup } from "test/test_helper"

testGroup("Text", () => testGroup("#removeTextAtRange", function() {
  test("removes text with range in single piece", function() {
    const text = new Text([ new StringPiece("abc") ])
    const pieces = text.removeTextAtRange([ 0, 1 ]).getPieces()
    assert.equal(pieces.length, 1)
    assert.equal(pieces[0].toString(), "bc")
    return assert.deepEqual(pieces[0].getAttributes(), {})
})

  return test("removes text with range spanning pieces", function() {
    const text = new Text([ new StringPiece("abc"), new StringPiece("123", { bold: true }) ])
    const pieces = text.removeTextAtRange([ 2, 4 ]).getPieces()
    assert.equal(pieces.length, 2)
    assert.equal(pieces[0].toString(), "ab")
    assert.deepEqual(pieces[0].getAttributes(), {})
    assert.equal(pieces[1].toString(), "23")
    return assert.deepEqual(pieces[1].getAttributes(), { bold: true })
  })
}))
