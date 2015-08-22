editorModule "Cursor movement", template: "editor_empty"

editorTest "move cursor around attachment", (done) ->
  insertFile(createFile())
  assertLocationRange(index: 0, offset: 1)
  moveCursor "left", ->
    assertLocationRange({index: 0, offset: 0}, {index: 0, offset: 1})
    moveCursor "left", ->
      assertLocationRange(index: 0, offset: 0)
      moveCursor "right", ->
        assertLocationRange({index: 0, offset: 0}, {index: 0, offset: 1})
        moveCursor "right", ->
          assertLocationRange(index: 0, offset: 1)
          done()

editorTest "move cursor around attachment and text", (done) ->
  insertString("a")
  insertFile(createFile())
  insertString("b")
  assertLocationRange(index: 0, offset: 3)
  moveCursor "left", ->
    assertLocationRange(index: 0, offset: 2)
    moveCursor "left", ->
      assertLocationRange({index: 0, offset: 1}, {index: 0, offset: 2})
      moveCursor "left", ->
        assertLocationRange(index: 0, offset: 1)
        moveCursor "left", ->
          assertLocationRange(index: 0, offset: 0)
          done()

editorTest "expand selection over attachment", (done) ->
  insertFile(createFile())
  assertLocationRange(index: 0, offset: 1)
  expandSelection "left", ->
    assertLocationRange({index: 0, offset: 0}, {index: 0, offset: 1})
    moveCursor "left", ->
      assertLocationRange(index: 0, offset: 0)
      expandSelection "right", ->
        assertLocationRange({index: 0, offset: 0}, {index: 0, offset: 1})
        done()

editorTest "expand selection over attachment and text", (done) ->
  insertString("a")
  insertFile(createFile())
  insertString("b")
  assertLocationRange(index: 0, offset: 3)
  expandSelection "left", ->
    assertLocationRange({index: 0, offset: 2}, {index: 0, offset: 3})
    expandSelection "left", ->
      assertLocationRange({index: 0, offset: 1}, {index: 0, offset: 3})
      expandSelection "left", ->
        assertLocationRange({index: 0, offset: 0}, {index: 0, offset: 3})
        done()
