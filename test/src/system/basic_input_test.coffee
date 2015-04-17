editorModule "Basic input", template: "editor_empty"

editorTest "typing", (expectDocument) ->
  typeCharacters "abc", ->
    expectDocument "abc\n"

editorTest "backspacing", (expectDocument) ->
  typeCharacters "abc\b", ->
    assertLocationRange [0,2]
    expectDocument "ab\n"

editorTest "pressing delete", (expectDocument) ->
  typeCharacters "ab", ->
    moveCursor "left", ->
      pressKey "delete", ->
        expectDocument "a\n"

editorTest "pressing return", (expectDocument) ->
  typeCharacters "ab\rc", ->
    expectDocument "ab\nc\n"

editorTest "cursor left", (expectDocument) ->
  typeCharacters "ac", ->
    moveCursor "left", ->
      typeCharacters "b", ->
        expectDocument "abc\n"

editorTest "replace entire document", (expectDocument) ->
  typeCharacters "abc", ->
    selectAll ->
      typeCharacters "d", ->
        expectDocument "d\n"

editorTest "remove entire document", (expectDocument) ->
  typeCharacters "abc", ->
    selectAll ->
      typeCharacters "\b", ->
        expectDocument "\n"

editorTest "paste plain text", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      pasteContent "text/plain", "!", ->
        expectDocument "ab!c\n"

editorTest "paste simple html", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      pasteContent "text/html", "&lt;", ->
        expectDocument "ab<c\n"

editorTest "paste complex html", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      pasteContent "text/html", "<div>Hello world<br></div><div>This is a test</div>", ->
        expectDocument "abHello world\nThis is a test\nc\n"

editorTest "paste complex html into formatted block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      pasteContent "text/html", "<div>Hello world<br></div><div>This is a test</div>", ->
        document = getDocument()
        equal 2, document.getBlockCount()

        block = document.getBlockAtIndex(0)
        deepEqual ["quote"], block.getAttributes()
        equal block.toString(), "abcHello world\n"

        block = document.getBlockAtIndex(1)
        deepEqual ["quote"], block.getAttributes()
        equal block.toString(), "This is a test\n"
        done()

editorTest "paste file", (expectDocument) ->
  pasteContent "Files", (createFile()), ->
    expectDocument "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

editorTest "drag text", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor direction: "left", times: 2, (coordinates) ->
      moveCursor "right", ->
        expandSelection "right", ->
          dragToCoordinates coordinates, ->
            expectDocument "acb\n"
