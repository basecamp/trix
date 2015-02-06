editorModule "Cursor movement", template: "editor_empty"

editorTest "move cursor around attachment", (done) ->
  insertFile(createFile())
  assertLocationRange([0,1])
  moveCursor "left", ->
    assertLocationRange([0,0])
    moveCursor "right", ->
      assertLocationRange([0,1])
      done()

editorTest "move cursor around attachment and text", (done) ->
  insertString("a")
  insertFile(createFile())
  insertString("b")
  assertLocationRange([0,3])
  moveCursor "left", ->
    assertLocationRange([0,2])
    moveCursor "left", ->
      assertLocationRange([0,1])
      moveCursor "left", ->
        assertLocationRange([0,0])
        done()

editorTest "expand selection over attachment", (done) ->
  insertFile(createFile())
  assertLocationRange([0,1])
  expandSelection "left", ->
    assertLocationRange([0,0], [0,1])
    moveCursor "left", ->
      assertLocationRange([0,0])
      expandSelection "right", ->
        assertLocationRange([0,0], [0,1])
        done()

editorTest "expand selection over attachment and text", (done) ->
  insertString("a")
  insertFile(createFile())
  insertString("b")
  assertLocationRange([0,3])
  expandSelection "left", ->
    assertLocationRange([0,2], [0,3])
    expandSelection "left", ->
      assertLocationRange([0,1], [0,3])
      expandSelection "left", ->
        assertLocationRange([0,0], [0,3])
        done()

insertString = (string) ->
  getComposition().insertString(string)
  render()

insertFile = (file) ->
  getComposition().insertFile(file)
  render()

render = ->
  getEditorController().render()
