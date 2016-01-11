editorModule "Pasting", template: "editor_empty", ->
  editorTest "paste plain text", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor "left", ->
        trix.pasteContent "text/plain", "!", ->
          expectDocument "ab!c\n"

  editorTest "paste simple html", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor "left", ->
        trix.pasteContent "text/html", "&lt;", ->
          expectDocument "ab<c\n"

  editorTest "paste complex html", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor "left", ->
        trix.pasteContent "text/html", "<div>Hello world<br></div><div>This is a test</div>", ->
          expectDocument "abHello world\nThis is a test\nc\n"

  editorTest "paste complex html into formatted block", (done) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.pasteContent "text/html", "<div>Hello world<br></div><pre>This is a test</pre>", ->
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
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "abc\n", ->
        trix.pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
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
    trix.clickToolbarButton attribute: "quote", ->
      trix.typeCharacters "abc", ->
        trix.pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
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
    trix.clickToolbarButton attribute: "quote", ->
      trix.clickToolbarButton attribute: "bullet", ->
        trix.typeCharacters "abc\n", ->
          trix.pasteContent "text/html", "<ul><li>one</li><li>two</li></ul>", ->
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
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "y\nzz", ->
        getSelectionManager().setLocationRange(index: 0, offset: 1)
        trix.defer ->
          trix.pressKey "backspace", ->
            trix.pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
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
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "y\nzz", ->
        getSelectionManager().setLocationRange(index: 0, offset: 1)
        trix.defer ->
          trix.expandSelection "left", ->
            trix.pasteContent "text/html", "<ul><li>a<ul><li>b</li></ul></li></ul>", ->
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
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "c", ->
        trix.moveCursor "left", ->
          trix.pressKey "return", ->
            getSelectionManager().setLocationRange(index: 0, offset: 0)
            trix.defer ->
              trix.pasteContent "text/html", "<ul><li>a</li><li>b</li></ul>", ->
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
    trix.typeCharacters "a", ->
      trix.pasteContent "Files", (trix.createFile()), ->
        expectDocument "a#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"
