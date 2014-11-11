editorModule "Cursor movement", template: "editor_empty"

asyncTest "move cursor around attachment", ->
  after 1, -> # IE 11 will crash without initial defer
    editor.composition.insertFile(createFile())
    assertLocationRange([0,1])
    moveCursor "left", ->
      assertLocationRange([0,0])
      moveCursor "right", ->
        assertLocationRange([0,1])
        QUnit.start()

asyncTest "move cursor around attachment and text", ->
  after 1, ->
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
          QUnit.start()
