editorModule "Block formatting", template: "editor_empty", ->
  editorTest "applying block attributes", (done) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        expectBlockAttributes([0, 4], ["quote"])
        ok trix.isToolbarButtonActive(attribute: "quote")
        trix.clickToolbarButton attribute: "code", ->
          expectBlockAttributes([0, 4], ["quote", "code"])
          ok trix.isToolbarButtonActive(attribute: "code")
          trix.clickToolbarButton attribute: "code", ->
            expectBlockAttributes([0, 4], ["quote"])
            ok not trix.isToolbarButtonActive(attribute: "code")
            ok trix.isToolbarButtonActive(attribute: "quote")
            done()

  editorTest "applying block attributes to text after newline", (done) ->
    trix.typeCharacters "a\nbc", ->
      trix.clickToolbarButton attribute: "quote", ->
        expectBlockAttributes([0, 2], [])
        expectBlockAttributes([2, 4], ["quote"])
        done()

  editorTest "applying block attributes to text between newlines", (done) ->
    trix.typeCharacters """
      ab
      def
      ghi
      j
    """, ->
      trix.moveCursor direction: "left", times: 2, ->
        trix.expandSelection direction: "left", times: 5, ->
          trix.clickToolbarButton attribute: "quote", ->
            expectBlockAttributes([0, 3], [])
            expectBlockAttributes([3, 11], ["quote"])
            expectBlockAttributes([11, 13], [])
            done()

  editorTest "applying bullets to text with newlines", (done) ->
    trix.typeCharacters """
      abc
      def
      ghi
      jkl
      mno
    """, ->
      trix.moveCursor direction: "left", times: 2, ->
        trix.expandSelection direction: "left", times: 15, ->
          trix.clickToolbarButton attribute: "bullet", ->
            expectBlockAttributes([0, 4], ["bulletList", "bullet"])
            expectBlockAttributes([4, 8], ["bulletList", "bullet"])
            expectBlockAttributes([8, 12], ["bulletList", "bullet"])
            expectBlockAttributes([12, 16], ["bulletList", "bullet"])
            expectBlockAttributes([16, 20], ["bulletList", "bullet"])
            done()

  editorTest "applying block attributes to adjacent unformatted blocks consolidates them", (done) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("1"), ["code"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("2"), ["code"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("3"), ["code"])
      ]

    trix.replaceDocument(document)
    getEditorController().setLocationRange([{index: 0, offset: 0}, {index: 5, offset: 1}])
    trix.defer ->
      trix.clickToolbarButton attribute: "quote", ->
        expectBlockAttributes([0, 2], ["code", "quote"])
        expectBlockAttributes([2, 8], ["quote"])
        expectBlockAttributes([8, 10], ["code", "quote"])
        expectBlockAttributes([10, 12], ["code", "quote"])
        done()

  editorTest "breaking out of the end of a block", (done) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.typeCharacters "\n\n", ->
          document = getDocument()
          equal document.getBlockCount(), 2

          block = document.getBlockAtIndex(0)
          deepEqual block.getAttributes(), ["quote"]
          equal block.toString(), "abc\n"

          block = document.getBlockAtIndex(1)
          deepEqual block.getAttributes(), []
          equal block.toString(), "\n"

          assertLocationRange(index: 1, offset: 0)
          done()


  editorTest "breaking out of the middle of a block before character", (done) ->
    # * = cursor
    #
    # ab
    # *c
    #
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.moveCursor "left", ->
          trix.typeCharacters "\n\n", ->
            document = getDocument()
            equal document.getBlockCount(), 3

            block = document.getBlockAtIndex(0)
            deepEqual block.getAttributes(), ["quote"]
            equal block.toString(), "ab\n"

            block = document.getBlockAtIndex(1)
            deepEqual block.getAttributes(), []
            equal block.toString(), "\n"

            block = document.getBlockAtIndex(2)
            deepEqual block.getAttributes(), ["quote"]
            equal block.toString(), "c\n"

            assertLocationRange(index: 2, offset: 0)
            done()

  editorTest "breaking out of the middle of a block before newline", (done) ->
    # * = cursor
    #
    # ab
    # *
    # c
    #
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.moveCursor "left", ->
          trix.typeCharacters "\n", ->
            trix.moveCursor "left", ->
              trix.typeCharacters "\n\n", ->
                document = getDocument()
                equal document.getBlockCount(), 3

                block = document.getBlockAtIndex(0)
                deepEqual block.getAttributes(), ["quote"]
                equal block.toString(), "ab\n"

                block = document.getBlockAtIndex(1)
                deepEqual block.getAttributes(), []
                equal block.toString(), "\n"

                block = document.getBlockAtIndex(2)
                deepEqual block.getAttributes(), ["quote"]
                equal block.toString(), "c\n"

                done()

  editorTest "breaking out a block after newline at offset 0", (done) ->
    # * = cursor
    #
    #
    # *a
    #
    trix.typeCharacters "a", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.moveCursor "left", ->
          trix.typeCharacters "\n\n", ->
            document = getDocument()
            equal document.getBlockCount(), 2

            block = document.getBlockAtIndex(0)
            deepEqual block.getAttributes(), []
            equal block.toString(), "\n"

            block = document.getBlockAtIndex(1)
            deepEqual block.getAttributes(), ["quote"]
            equal block.toString(), "a\n"
            assertLocationRange(index: 1, offset: 0)

            done()

  editorTest "deleting the only non-block-break character in a block", (done) ->
    trix.typeCharacters "ab", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.typeCharacters "\b\b", ->
          expectBlockAttributes([0, 1], ["quote"])
          done()

  editorTest "backspacing a quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      expectBlockAttributes([0, 1], ["quote"])
      trix.pressKey "backspace", ->
        expectBlockAttributes([0, 1], [])
        done()

  editorTest "backspacing a nested quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.clickToolbarButton action: "increaseBlockLevel", ->
        expectBlockAttributes([0, 1], ["quote", "quote"])
        trix.pressKey "backspace", ->
          expectBlockAttributes([0, 1], ["quote"])
          trix.pressKey "backspace", ->
            expectBlockAttributes([0, 1], [])
            done()

  editorTest "backspacing a list item", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      expectBlockAttributes([0, 1], ["bulletList", "bullet"])
      trix.pressKey "backspace", ->
        expectBlockAttributes([0, 0], [])
        done()

  editorTest "backspacing a nested list item", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\n", ->
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          expectBlockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"])
          trix.pressKey "backspace", ->
            expectBlockAttributes([2, 3], ["bulletList", "bullet"])
            expectDocument("a\n\n")

  editorTest "backspacing a list item inside a quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.clickToolbarButton attribute: "bullet", ->
        expectBlockAttributes([0, 1], ["quote", "bulletList", "bullet"])
        trix.pressKey "backspace", ->
          expectBlockAttributes([0, 1], ["quote"])
          trix.pressKey "backspace", ->
            expectBlockAttributes([0, 1], [])
            done()

  editorTest "backspacing selected nested list items", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\n", ->
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.typeCharacters "b", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            trix.pressKey "backspace", ->
              expectBlockAttributes([0, 1], ["bulletList", "bullet"])
              expectDocument("\n")

  editorTest "backspace selection spanning formatted blocks", (expectDocument) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.typeCharacters "ab\n\n", ->
        trix.clickToolbarButton attribute: "code", ->
          trix.typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 1}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            expectBlockAttributes([0, 2], ["quote"])
            expectDocument("ad\n")

  editorTest "backspace selection spanning and entire formatted block and a formatted block", (expectDocument) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.typeCharacters "ab\n\n", ->
        trix.clickToolbarButton attribute: "code", ->
          trix.typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            expectBlockAttributes([0, 2], ["code"])
            expectDocument("d\n")

  editorTest "increasing list level", (done) ->
    ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
    ok trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
    trix.clickToolbarButton attribute: "bullet", ->
      ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
      ok not trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
      trix.typeCharacters "a\n", ->
        ok not trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
        ok not trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.typeCharacters "b", ->
            ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
            ok not trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
            expectBlockAttributes([0, 2], ["bulletList", "bullet"])
            expectBlockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"])
            done()

  editorTest "changing list type", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      expectBlockAttributes([0, 1], ["bulletList", "bullet"])
      trix.clickToolbarButton attribute: "number", ->
        expectBlockAttributes([0, 1], ["numberList", "number"])
        done()
