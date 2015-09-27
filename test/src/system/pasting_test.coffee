editorModule "Pasting", template: "editor_empty"

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
      pasteContent "text/html", "<div>Hello world<br></div><pre>This is a test</pre>", ->
        document = getDocument()
        equal document.getBlockCount(), 2

        block = document.getBlockAtIndex(0)
        deepEqual block.getAttributes(), ["quote"],
        equal block.toString(), "abcHello world\n"

        block = document.getBlockAtIndex(1)
        deepEqual block.getAttributes(), ["quote", "code"]
        equal block.toString(), "This is a test\n"

        done()

editorTest "paste list into list", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "abc\n", ->
      pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
        document = getDocument()
        equal document.getBlockCount(), 3

        block = document.getBlockAtIndex(0)
        deepEqual block.getAttributes(), ["bulletList", "bullet"]
        equal block.toString(), "abc\n"

        block = document.getBlockAtIndex(1)
        deepEqual block.getAttributes(), ["bulletList", "bullet"]
        equal block.toString(), "one\n"

        block = document.getBlockAtIndex(2)
        deepEqual block.getAttributes(), ["bulletList", "bullet"]
        equal block.toString(), "two\n"

        done()

editorTest "paste list into quote", (done) ->
  clickToolbarButton attribute: "quote", ->
    typeCharacters "abc", ->
      pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
        document = getDocument()
        equal document.getBlockCount(), 3

        block = document.getBlockAtIndex(0)
        deepEqual block.getAttributes(), ["quote"]
        equal block.toString(), "abc\n"

        block = document.getBlockAtIndex(1)
        deepEqual block.getAttributes(), ["quote", "bulletList", "bullet"]
        equal block.toString(), "one\n"

        block = document.getBlockAtIndex(2)
        deepEqual block.getAttributes(), ["quote", "bulletList", "bullet"]
        equal block.toString(), "two\n"

        done()

editorTest "paste list into quoted list", (done) ->
  clickToolbarButton attribute: "quote", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "abc\n", ->
        pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
          document = getDocument()
          equal document.getBlockCount(), 3

          block = document.getBlockAtIndex(0)
          deepEqual block.getAttributes(), ["quote", "bulletList", "bullet"]
          equal block.toString(), "abc\n"

          block = document.getBlockAtIndex(1)
          deepEqual block.getAttributes(), ["quote", "bulletList", "bullet"]
          equal block.toString(), "one\n"

          block = document.getBlockAtIndex(2)
          deepEqual block.getAttributes(), ["quote", "bulletList", "bullet"]
          equal block.toString(), "two\n"

          done()

editorTest "paste nested list into empty list item", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "y\nzz", ->
      getSelectionManager().setLocationRange(index: 0, offset: 1)
      defer ->
        pressKey "backspace", ->
          pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
          document = getDocument()
          equal document.getBlockCount(), 3

          block = document.getBlockAtIndex(0)
          deepEqual block.getAttributes(), ["bulletList", "bullet"]
          equal block.toString(), "a\n"

          block = document.getBlockAtIndex(1)
          deepEqual block.getAttributes(), ["bulletList", "bullet", "bulletList", "bullet"]
          equal block.toString(), "b\n"

          block = document.getBlockAtIndex(2)
          deepEqual block.getAttributes(), ["bulletList", "bullet"]
          equal block.toString(), "zz\n"
          done()

editorTest "paste nested list over list item contents", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "y\nzz", ->
      getSelectionManager().setLocationRange(index: 0, offset: 1)
      defer ->
        expandSelection "left", ->
          pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
          document = getDocument()
          equal document.getBlockCount(), 3

          block = document.getBlockAtIndex(0)
          deepEqual block.getAttributes(), ["bulletList", "bullet"]
          equal block.toString(), "a\n"

          block = document.getBlockAtIndex(1)
          deepEqual block.getAttributes(), ["bulletList", "bullet", "bulletList", "bullet"]
          equal block.toString(), "b\n"

          block = document.getBlockAtIndex(2)
          deepEqual block.getAttributes(), ["bulletList", "bullet"]
          equal block.toString(), "zz\n"
          done()

editorTest "paste list into empty block before list", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "c", ->
      moveCursor "left", ->
        pressKey "return", ->
          getSelectionManager().setLocationRange(index: 0, offset: 0)
          defer ->
            pasteContent "text/html", "<ul><li>a</li><li>b</li></ul>", ->
              document = getDocument()
              equal document.getBlockCount(), 3

              block = document.getBlockAtIndex(0)
              deepEqual block.getAttributes(), ["bulletList", "bullet"]
              equal block.toString(), "a\n"

              block = document.getBlockAtIndex(1)
              deepEqual block.getAttributes(), ["bulletList", "bullet"]
              equal block.toString(), "b\n"

              block = document.getBlockAtIndex(2)
              deepEqual block.getAttributes(), ["bulletList", "bullet"]
              equal block.toString(), "c\n"
              done()

editorTest "paste file", (expectDocument) ->
  typeCharacters "a", ->
    pasteContent "Files", (createFile()), ->
      expectDocument "a#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
