{assert, createFile, expandSelection, insertFile, insertString, moveCursor, test, testGroup} = Trix.TestHelpers

testGroup "Cursor movement", template: "editor_empty", ->
  test "move cursor around attachment", (done) ->
    insertFile(createFile())
    assert.locationRange(index: 0, offset: 1)
    moveCursor "left", ->
      assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
      moveCursor "left", ->
        assert.locationRange(index: 0, offset: 0)
        moveCursor "right", ->
          assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
          moveCursor "right", ->
            assert.locationRange(index: 0, offset: 1)
            done()

  test "move cursor around attachment and text", (done) ->
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange(index: 0, offset: 3)
    moveCursor "left", ->
      assert.locationRange(index: 0, offset: 2)
      moveCursor "left", ->
        assert.locationRange({index: 0, offset: 1}, {index: 0, offset: 2})
        moveCursor "left", ->
          assert.locationRange(index: 0, offset: 1)
          moveCursor "left", ->
            assert.locationRange(index: 0, offset: 0)
            done()

  test "expand selection over attachment", (done) ->
    insertFile(createFile())
    assert.locationRange(index: 0, offset: 1)
    expandSelection "left", ->
      assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
      moveCursor "left", ->
        assert.locationRange(index: 0, offset: 0)
        expandSelection "right", ->
          assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 1})
          done()

  test "expand selection over attachment and text", (done) ->
    insertString("a")
    insertFile(createFile())
    insertString("b")
    assert.locationRange(index: 0, offset: 3)
    expandSelection "left", ->
      assert.locationRange({index: 0, offset: 2}, {index: 0, offset: 3})
      expandSelection "left", ->
        assert.locationRange({index: 0, offset: 1}, {index: 0, offset: 3})
        expandSelection "left", ->
          assert.locationRange({index: 0, offset: 0}, {index: 0, offset: 3})
          done()
