editorModule "Basic input", template: "editor_empty"

editorTest "typing", (expectDocument) ->
  typeCharacters "abc", ->
    expectDocument "abc\n"

editorTest "composing", (expectDocument) ->
  composeString "abc", ->
    expectDocument "abc\n"

editorTest "typing and composing", (expectDocument) ->
  typeCharacters "a", ->
    composeString "bcd", ->
      typeCharacters "e", ->
        expectDocument "abcde\n"

editorTest "backspacing", (expectDocument) ->
  typeCharacters "abc\b", ->
    assertLocationRange [0,2]
    expectDocument "ab\n"

QUnit.skip "backspacing emoji and typing", (expectDocument) ->
  # The helpers need to be fixed for this test to pass.
  typeCharacters "abc😭", ->
    assertLocationRange [0,5]
    typeCharacters "\b", ->
      assertLocationRange [0,3]
      typeCharacters "d", ->
        assertLocationRange [0,4]
        expectDocument "abcd\n"

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

editorTest "paste nested list into empty list item", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "y\nzz", ->
      getSelectionManager().setLocationRange([0,1])
      defer ->
        pressKey "backspace", ->
          pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
          document = getDocument()
          equal 3, document.getBlockCount()

          block = document.getBlockAtIndex(0)
          deepEqual ["bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "a\n"

          block = document.getBlockAtIndex(1)
          deepEqual ["bulletList", "bullet", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "b\n"

          block = document.getBlockAtIndex(2)
          deepEqual ["bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "zz\n"
          done()

editorTest "paste nested list over list item contents", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "y\nzz", ->
      getSelectionManager().setLocationRange([0,1])
      defer ->
        expandSelection "left", ->
          pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
          document = getDocument()
          equal 3, document.getBlockCount()

          block = document.getBlockAtIndex(0)
          deepEqual ["bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "a\n"

          block = document.getBlockAtIndex(1)
          deepEqual ["bulletList", "bullet", "bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "b\n"

          block = document.getBlockAtIndex(2)
          deepEqual ["bulletList", "bullet"], block.getAttributes()
          equal block.toString(), "zz\n"
          done()

editorTest "paste file", (expectDocument) ->
  typeCharacters "a", ->
    pasteContent "Files", (createFile()), ->
      expectDocument "a#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

editorTest "drag text", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor direction: "left", times: 2, (coordinates) ->
      moveCursor "right", ->
        expandSelection "right", ->
          dragToCoordinates coordinates, ->
            expectDocument "acb\n"
