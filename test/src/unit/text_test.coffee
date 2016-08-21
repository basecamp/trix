{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.Text", ->
  testGroup "#removeTextAtRange", ->
    test "removes text with range in single piece", ->
      text = new Trix.Text [new Trix.StringPiece("abc")]
      pieces = text.removeTextAtRange([0,1]).getPieces()
      assert.equal pieces.length, 1
      assert.equal pieces[0].toString(), "bc"
      assert.deepEqual pieces[0].getAttributes(), {}

    test "removes text with range spanning pieces", ->
      text = new Trix.Text [new Trix.StringPiece("abc"), new Trix.StringPiece("123", bold: true)]
      pieces = text.removeTextAtRange([2,4]).getPieces()
      assert.equal pieces.length, 2
      assert.equal pieces[0].toString(), "ab"
      assert.deepEqual pieces[0].getAttributes(), {}
      assert.equal pieces[1].toString(), "23"
      assert.deepEqual pieces[1].getAttributes(), bold: true
