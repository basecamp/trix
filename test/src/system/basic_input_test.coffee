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
  typeCharacters "ab", ->
    pressKey "return", ->
      typeCharacters "c", ->
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
        expectDocument "ab\nHello world\nThis is a test\nc\n"

editorTest "paste complex html into formatted block", (done) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "quote", ->
      pasteContent "text/html", "<div>Hello world<br></div><pre>This is a test</pre>", ->
        document = getDocument()
        equal 3, document.getBlockCount()

        block = document.getBlockAtIndex(0)
        deepEqual ["quote"], block.getAttributes()
        equal block.toString(), "abc\n"

        block = document.getBlockAtIndex(1)
        deepEqual ["quote"], block.getAttributes()
        equal block.toString(), "Hello world\n"

        block = document.getBlockAtIndex(2)
        deepEqual ["quote", "code"], block.getAttributes()
        equal block.toString(), "This is a test\n"

        done()

editorTest "paste list into list", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "abc\n", ->
      pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
        document = getDocument()
        equal 4, document.getBlockCount()

        block = document.getBlockAtIndex(0)
        deepEqual ["bulletList", "bullet"], block.getAttributes()
        equal block.toString(), "abc\n"

        block = document.getBlockAtIndex(1)
        deepEqual ["bulletList", "bullet"], block.getAttributes()
        equal block.toString(), "one\n"

        block = document.getBlockAtIndex(2)
        deepEqual ["bulletList", "bullet"], block.getAttributes()
        equal block.toString(), "two\n"

        block = document.getBlockAtIndex(3)
        deepEqual ["bulletList", "bullet"], block.getAttributes()
        equal block.toString(), "\n"

        done()

editorTest "paste list into quoted list", (done) ->
  clickToolbarButton attribute: "quote", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "abc\n", ->
        pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
          document = getDocument()
          equal 4, document.getBlockCount()

          block = document.getBlockAtIndex(0)
          deepEqual ["quote", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "abc\n"

          block = document.getBlockAtIndex(1)
          deepEqual ["quote", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "one\n"

          block = document.getBlockAtIndex(2)
          deepEqual ["quote", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "two\n"

          block = document.getBlockAtIndex(3)
          deepEqual ["quote", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "\n"

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
