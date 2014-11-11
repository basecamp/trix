editorModule "Cursor movement", template: "editor_empty"

editorTest "move cursor around attachment", (done) ->
  editor.composition.insertFile(createFile())
  assertLocationRange([0,1])
  moveCursor "left", ->
    assertLocationRange([0,0])
    moveCursor "right", ->
      assertLocationRange([0,1])
      done()

editorTest "move cursor around attachment and text", (done) ->
  editor.composition.insertString("a")
  editor.composition.insertFile(createFile())
  editor.composition.insertString("b")
  assertLocationRange([0,3])
  moveCursor "left", ->
    assertLocationRange([0,2])
    moveCursor "left", ->
      assertLocationRange([0,1])
      moveCursor "left", ->
        assertLocationRange([0,0])
        done()

editorTest "expand selection over attachment", (done) ->
  editor.composition.insertFile(createFile())
  assertLocationRange([0,1])
  selectInDirection "left", ->
    assertLocationRange([0,0], [0,1])
    moveCursorToBeginning ->
      assertLocationRange([0,0])
      selectInDirection "right", ->
        assertLocationRange([0,0], [0,1])
        done()

editorTest "expand selection over attachment and text", (done) ->
  editor.composition.insertString("a")
  editor.composition.insertFile(createFile())
  editor.composition.insertString("b")
  assertLocationRange([0,3])
  selectInDirection "left", ->
    assertLocationRange([0,2], [0,3])
    selectInDirection "left", ->
      assertLocationRange([0,1], [0,3])
      selectInDirection "left", ->
        assertLocationRange([0,0], [0,3])
        done()
