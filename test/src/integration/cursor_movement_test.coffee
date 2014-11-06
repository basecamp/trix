editorModule "Cursor movement", template: "editor_empty"

asyncTest "move cursor around attachment", ->
  editor.composition.insertFile(createFile())
  assertLocationRange([0,1])
  moveCursor "left", ->
    assertLocationRange([0,0])
    moveCursor "right", ->
      assertLocationRange([0,1])
      QUnit.start()
