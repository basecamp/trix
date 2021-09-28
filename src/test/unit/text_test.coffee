import Text from "trix/models/text"
import StringPiece from "trix/models/string_piece"

import { assert, test, testGroup } from "test/test_helper"

testGroup "Text", ->
  testGroup "#removeTextAtRange", ->
    test "removes text with range in single piece", ->
      text = new Text [new StringPiece("abc")]
      pieces = text.removeTextAtRange([0,1]).getPieces()
      assert.equal pieces.length, 1
      assert.equal pieces[0].toString(), "bc"
      assert.deepEqual pieces[0].getAttributes(), {}

    test "removes text with range spanning pieces", ->
      text = new Text [new StringPiece("abc"), new StringPiece("123", bold: true)]
      pieces = text.removeTextAtRange([2,4]).getPieces()
      assert.equal pieces.length, 2
      assert.equal pieces[0].toString(), "ab"
      assert.deepEqual pieces[0].getAttributes(), {}
      assert.equal pieces[1].toString(), "23"
      assert.deepEqual pieces[1].getAttributes(), bold: true
