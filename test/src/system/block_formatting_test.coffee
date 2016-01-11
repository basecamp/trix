trix.testGroup "Block formatting", template: "editor_empty", ->
  trix.test "applying block attributes", (done) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.assert.blockAttributes([0, 4], ["quote"])
        trix.assert.ok trix.isToolbarButtonActive(attribute: "quote")
        trix.clickToolbarButton attribute: "code", ->
          trix.assert.blockAttributes([0, 4], ["quote", "code"])
          trix.assert.ok trix.isToolbarButtonActive(attribute: "code")
          trix.clickToolbarButton attribute: "code", ->
            trix.assert.blockAttributes([0, 4], ["quote"])
            trix.assert.notOk trix.isToolbarButtonActive(attribute: "code")
            trix.assert.ok trix.isToolbarButtonActive(attribute: "quote")
            done()

  trix.test "applying block attributes to text after newline", (done) ->
    trix.typeCharacters "a\nbc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.assert.blockAttributes([0, 2], [])
        trix.assert.blockAttributes([2, 4], ["quote"])
        done()

  trix.test "applying block attributes to text between newlines", (done) ->
    trix.typeCharacters """
      ab
      def
      ghi
      j
    """, ->
      trix.moveCursor direction: "left", times: 2, ->
        trix.expandSelection direction: "left", times: 5, ->
          trix.clickToolbarButton attribute: "quote", ->
            trix.assert.blockAttributes([0, 3], [])
            trix.assert.blockAttributes([3, 11], ["quote"])
            trix.assert.blockAttributes([11, 13], [])
            done()

  trix.test "applying bullets to text with newlines", (done) ->
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
            trix.assert.blockAttributes([0, 4], ["bulletList", "bullet"])
            trix.assert.blockAttributes([4, 8], ["bulletList", "bullet"])
            trix.assert.blockAttributes([8, 12], ["bulletList", "bullet"])
            trix.assert.blockAttributes([12, 16], ["bulletList", "bullet"])
            trix.assert.blockAttributes([16, 20], ["bulletList", "bullet"])
            done()

  trix.test "applying block attributes to adjacent unformatted blocks consolidates them", (done) ->
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
        trix.assert.blockAttributes([0, 2], ["code", "quote"])
        trix.assert.blockAttributes([2, 8], ["quote"])
        trix.assert.blockAttributes([8, 10], ["code", "quote"])
        trix.assert.blockAttributes([10, 12], ["code", "quote"])
        done()

  trix.test "breaking out of the end of a block", (done) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.typeCharacters "\n\n", ->
          document = getDocument()
          trix.assert.equal document.getBlockCount(), 2

          block = document.getBlockAtIndex(0)
          trix.assert.deepEqual block.getAttributes(), ["quote"]
          trix.assert.equal block.toString(), "abc\n"

          block = document.getBlockAtIndex(1)
          trix.assert.deepEqual block.getAttributes(), []
          trix.assert.equal block.toString(), "\n"

          trix.assert.locationRange(index: 1, offset: 0)
          done()


  trix.test "breaking out of the middle of a block before character", (done) ->
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
            trix.assert.equal document.getBlockCount(), 3

            block = document.getBlockAtIndex(0)
            trix.assert.deepEqual block.getAttributes(), ["quote"]
            trix.assert.equal block.toString(), "ab\n"

            block = document.getBlockAtIndex(1)
            trix.assert.deepEqual block.getAttributes(), []
            trix.assert.equal block.toString(), "\n"

            block = document.getBlockAtIndex(2)
            trix.assert.deepEqual block.getAttributes(), ["quote"]
            trix.assert.equal block.toString(), "c\n"

            trix.assert.locationRange(index: 2, offset: 0)
            done()

  trix.test "breaking out of the middle of a block before newline", (done) ->
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
                trix.assert.equal document.getBlockCount(), 3

                block = document.getBlockAtIndex(0)
                trix.assert.deepEqual block.getAttributes(), ["quote"]
                trix.assert.equal block.toString(), "ab\n"

                block = document.getBlockAtIndex(1)
                trix.assert.deepEqual block.getAttributes(), []
                trix.assert.equal block.toString(), "\n"

                block = document.getBlockAtIndex(2)
                trix.assert.deepEqual block.getAttributes(), ["quote"]
                trix.assert.equal block.toString(), "c\n"

                done()

  trix.test "breaking out a block after newline at offset 0", (done) ->
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
            trix.assert.equal document.getBlockCount(), 2

            block = document.getBlockAtIndex(0)
            trix.assert.deepEqual block.getAttributes(), []
            trix.assert.equal block.toString(), "\n"

            block = document.getBlockAtIndex(1)
            trix.assert.deepEqual block.getAttributes(), ["quote"]
            trix.assert.equal block.toString(), "a\n"
            trix.assert.locationRange(index: 1, offset: 0)

            done()

  trix.test "deleting the only non-block-break character in a block", (done) ->
    trix.typeCharacters "ab", ->
      trix.clickToolbarButton attribute: "quote", ->
        trix.typeCharacters "\b\b", ->
          trix.assert.blockAttributes([0, 1], ["quote"])
          done()

  trix.test "backspacing a quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.assert.blockAttributes([0, 1], ["quote"])
      trix.pressKey "backspace", ->
        trix.assert.blockAttributes([0, 1], [])
        done()

  trix.test "backspacing a nested quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.clickToolbarButton action: "increaseBlockLevel", ->
        trix.assert.blockAttributes([0, 1], ["quote", "quote"])
        trix.pressKey "backspace", ->
          trix.assert.blockAttributes([0, 1], ["quote"])
          trix.pressKey "backspace", ->
            trix.assert.blockAttributes([0, 1], [])
            done()

  trix.test "backspacing a list item", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.assert.blockAttributes([0, 1], ["bulletList", "bullet"])
      trix.pressKey "backspace", ->
        trix.assert.blockAttributes([0, 0], [])
        done()

  trix.test "backspacing a nested list item", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\n", ->
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"])
          trix.pressKey "backspace", ->
            trix.assert.blockAttributes([2, 3], ["bulletList", "bullet"])
            expectDocument("a\n\n")

  trix.test "backspacing a list item inside a quote", (done) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.clickToolbarButton attribute: "bullet", ->
        trix.assert.blockAttributes([0, 1], ["quote", "bulletList", "bullet"])
        trix.pressKey "backspace", ->
          trix.assert.blockAttributes([0, 1], ["quote"])
          trix.pressKey "backspace", ->
            trix.assert.blockAttributes([0, 1], [])
            done()

  trix.test "backspacing selected nested list items", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\n", ->
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.typeCharacters "b", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            trix.pressKey "backspace", ->
              trix.assert.blockAttributes([0, 1], ["bulletList", "bullet"])
              expectDocument("\n")

  trix.test "backspace selection spanning formatted blocks", (expectDocument) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.typeCharacters "ab\n\n", ->
        trix.clickToolbarButton attribute: "code", ->
          trix.typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 1}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            trix.assert.blockAttributes([0, 2], ["quote"])
            expectDocument("ad\n")

  trix.test "backspace selection spanning and entire formatted block and a formatted block", (expectDocument) ->
    trix.clickToolbarButton attribute: "quote", ->
      trix.typeCharacters "ab\n\n", ->
        trix.clickToolbarButton attribute: "code", ->
          trix.typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            trix.assert.blockAttributes([0, 2], ["code"])
            expectDocument("d\n")

  trix.test "increasing list level", (done) ->
    trix.assert.ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
    trix.assert.ok trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
    trix.clickToolbarButton attribute: "bullet", ->
      trix.assert.ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
      trix.assert.notOk trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
      trix.typeCharacters "a\n", ->
        trix.assert.notOk trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
        trix.assert.notOk trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.typeCharacters "b", ->
            trix.assert.ok trix.isToolbarButtonDisabled(action: "increaseBlockLevel")
            trix.assert.notOk trix.isToolbarButtonDisabled(action: "decreaseBlockLevel")
            trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
            trix.assert.blockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"])
            done()

  trix.test "changing list type", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.assert.blockAttributes([0, 1], ["bulletList", "bullet"])
      trix.clickToolbarButton attribute: "number", ->
        trix.assert.blockAttributes([0, 1], ["numberList", "number"])
        done()
