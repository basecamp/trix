{assert, clickToolbarButton, defer, expandSelection, isToolbarButtonActive, isToolbarButtonDisabled, moveCursor, pressKey, replaceDocument, test, testGroup, typeCharacters} = Trix.TestHelpers

testGroup "Block formatting", template: "editor_empty", ->
  test "applying block attributes", (done) ->
    typeCharacters "abc", ->
      clickToolbarButton attribute: "quote", ->
        assert.blockAttributes([0, 4], ["quote"])
        assert.ok isToolbarButtonActive(attribute: "quote")
        clickToolbarButton attribute: "code", ->
          assert.blockAttributes([0, 4], ["quote", "code"])
          assert.ok isToolbarButtonActive(attribute: "code")
          clickToolbarButton attribute: "code", ->
            assert.blockAttributes([0, 4], ["quote"])
            assert.notOk isToolbarButtonActive(attribute: "code")
            assert.ok isToolbarButtonActive(attribute: "quote")
            done()

  test "applying block attributes to text after newline", (done) ->
    typeCharacters "a\nbc", ->
      clickToolbarButton attribute: "quote", ->
        assert.blockAttributes([0, 2], [])
        assert.blockAttributes([2, 4], ["quote"])
        done()

  test "applying block attributes to text between newlines", (done) ->
    typeCharacters """
      ab
      def
      ghi
      j
    """, ->
      moveCursor direction: "left", times: 2, ->
        expandSelection direction: "left", times: 5, ->
          clickToolbarButton attribute: "quote", ->
            assert.blockAttributes([0, 3], [])
            assert.blockAttributes([3, 11], ["quote"])
            assert.blockAttributes([11, 13], [])
            done()

  test "applying bullets to text with newlines", (done) ->
    typeCharacters """
      abc
      def
      ghi
      jkl
      mno
    """, ->
      moveCursor direction: "left", times: 2, ->
        expandSelection direction: "left", times: 15, ->
          clickToolbarButton attribute: "bullet", ->
            assert.blockAttributes([0, 4], ["bulletList", "bullet"])
            assert.blockAttributes([4, 8], ["bulletList", "bullet"])
            assert.blockAttributes([8, 12], ["bulletList", "bullet"])
            assert.blockAttributes([12, 16], ["bulletList", "bullet"])
            assert.blockAttributes([16, 20], ["bulletList", "bullet"])
            done()

  test "applying block attributes to adjacent unformatted blocks consolidates them", (done) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("1"), ["code"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("2"), ["code"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("3"), ["code"])
      ]

    replaceDocument(document)
    getEditorController().setLocationRange([{index: 0, offset: 0}, {index: 5, offset: 1}])
    defer ->
      clickToolbarButton attribute: "quote", ->
        assert.blockAttributes([0, 2], ["code", "quote"])
        assert.blockAttributes([2, 8], ["quote"])
        assert.blockAttributes([8, 10], ["code", "quote"])
        assert.blockAttributes([10, 12], ["code", "quote"])
        done()

  test "breaking out of the end of a block", (done) ->
    typeCharacters "abc", ->
      clickToolbarButton attribute: "quote", ->
        typeCharacters "\n\n", ->
          document = getDocument()
          assert.equal document.getBlockCount(), 2

          block = document.getBlockAtIndex(0)
          assert.deepEqual block.getAttributes(), ["quote"]
          assert.equal block.toString(), "abc\n"

          block = document.getBlockAtIndex(1)
          assert.deepEqual block.getAttributes(), []
          assert.equal block.toString(), "\n"

          assert.locationRange(index: 1, offset: 0)
          done()


  test "breaking out of the middle of a block before character", (done) ->
    # * = cursor
    #
    # ab
    # *c
    #
    typeCharacters "abc", ->
      clickToolbarButton attribute: "quote", ->
        moveCursor "left", ->
          typeCharacters "\n\n", ->
            document = getDocument()
            assert.equal document.getBlockCount(), 3

            block = document.getBlockAtIndex(0)
            assert.deepEqual block.getAttributes(), ["quote"]
            assert.equal block.toString(), "ab\n"

            block = document.getBlockAtIndex(1)
            assert.deepEqual block.getAttributes(), []
            assert.equal block.toString(), "\n"

            block = document.getBlockAtIndex(2)
            assert.deepEqual block.getAttributes(), ["quote"]
            assert.equal block.toString(), "c\n"

            assert.locationRange(index: 2, offset: 0)
            done()

  test "breaking out of the middle of a block before newline", (done) ->
    # * = cursor
    #
    # ab
    # *
    # c
    #
    typeCharacters "abc", ->
      clickToolbarButton attribute: "quote", ->
        moveCursor "left", ->
          typeCharacters "\n", ->
            moveCursor "left", ->
              typeCharacters "\n\n", ->
                document = getDocument()
                assert.equal document.getBlockCount(), 3

                block = document.getBlockAtIndex(0)
                assert.deepEqual block.getAttributes(), ["quote"]
                assert.equal block.toString(), "ab\n"

                block = document.getBlockAtIndex(1)
                assert.deepEqual block.getAttributes(), []
                assert.equal block.toString(), "\n"

                block = document.getBlockAtIndex(2)
                assert.deepEqual block.getAttributes(), ["quote"]
                assert.equal block.toString(), "c\n"

                done()

  test "breaking out a block after newline at offset 0", (done) ->
    # * = cursor
    #
    #
    # *a
    #
    typeCharacters "a", ->
      clickToolbarButton attribute: "quote", ->
        moveCursor "left", ->
          typeCharacters "\n\n", ->
            document = getDocument()
            assert.equal document.getBlockCount(), 2

            block = document.getBlockAtIndex(0)
            assert.deepEqual block.getAttributes(), []
            assert.equal block.toString(), "\n"

            block = document.getBlockAtIndex(1)
            assert.deepEqual block.getAttributes(), ["quote"]
            assert.equal block.toString(), "a\n"
            assert.locationRange(index: 1, offset: 0)

            done()

  test "deleting the only non-block-break character in a block", (done) ->
    typeCharacters "ab", ->
      clickToolbarButton attribute: "quote", ->
        typeCharacters "\b\b", ->
          assert.blockAttributes([0, 1], ["quote"])
          done()

  test "backspacing a quote", (done) ->
    clickToolbarButton attribute: "quote", ->
      assert.blockAttributes([0, 1], ["quote"])
      pressKey "backspace", ->
        assert.blockAttributes([0, 1], [])
        done()

  test "backspacing a nested quote", (done) ->
    clickToolbarButton attribute: "quote", ->
      clickToolbarButton action: "increaseBlockLevel", ->
        assert.blockAttributes([0, 1], ["quote", "quote"])
        pressKey "backspace", ->
          assert.blockAttributes([0, 1], ["quote"])
          pressKey "backspace", ->
            assert.blockAttributes([0, 1], [])
            done()

  test "backspacing a list item", (done) ->
    clickToolbarButton attribute: "bullet", ->
      assert.blockAttributes([0, 1], ["bulletList", "bullet"])
      pressKey "backspace", ->
        assert.blockAttributes([0, 0], [])
        done()

  test "backspacing a nested list item", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\n", ->
        clickToolbarButton action: "increaseBlockLevel", ->
          assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"])
          pressKey "backspace", ->
            assert.blockAttributes([2, 3], ["bulletList", "bullet"])
            expectDocument("a\n\n")

  test "backspacing a list item inside a quote", (done) ->
    clickToolbarButton attribute: "quote", ->
      clickToolbarButton attribute: "bullet", ->
        assert.blockAttributes([0, 1], ["quote", "bulletList", "bullet"])
        pressKey "backspace", ->
          assert.blockAttributes([0, 1], ["quote"])
          pressKey "backspace", ->
            assert.blockAttributes([0, 1], [])
            done()

  test "backspacing selected nested list items", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\n", ->
        clickToolbarButton action: "increaseBlockLevel", ->
          typeCharacters "b", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            pressKey "backspace", ->
              assert.blockAttributes([0, 1], ["bulletList", "bullet"])
              expectDocument("\n")

  test "backspace selection spanning formatted blocks", (expectDocument) ->
    clickToolbarButton attribute: "quote", ->
      typeCharacters "ab\n\n", ->
        clickToolbarButton attribute: "code", ->
          typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 1}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            assert.blockAttributes([0, 2], ["quote"])
            expectDocument("ad\n")

  test "backspace selection spanning and entire formatted block and a formatted block", (expectDocument) ->
    clickToolbarButton attribute: "quote", ->
      typeCharacters "ab\n\n", ->
        clickToolbarButton attribute: "code", ->
          typeCharacters "cd", ->
            getSelectionManager().setLocationRange([{index: 0, offset: 0}, {index: 1, offset: 1}])
            getComposition().deleteInDirection("backward")
            assert.blockAttributes([0, 2], ["code"])
            expectDocument("d\n")

  test "increasing list level", (done) ->
    assert.ok isToolbarButtonDisabled(action: "increaseBlockLevel")
    assert.ok isToolbarButtonDisabled(action: "decreaseBlockLevel")
    clickToolbarButton attribute: "bullet", ->
      assert.ok isToolbarButtonDisabled(action: "increaseBlockLevel")
      assert.notOk isToolbarButtonDisabled(action: "decreaseBlockLevel")
      typeCharacters "a\n", ->
        assert.notOk isToolbarButtonDisabled(action: "increaseBlockLevel")
        assert.notOk isToolbarButtonDisabled(action: "decreaseBlockLevel")
        clickToolbarButton action: "increaseBlockLevel", ->
          typeCharacters "b", ->
            assert.ok isToolbarButtonDisabled(action: "increaseBlockLevel")
            assert.notOk isToolbarButtonDisabled(action: "decreaseBlockLevel")
            assert.blockAttributes([0, 2], ["bulletList", "bullet"])
            assert.blockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"])
            done()

  test "changing list type", (done) ->
    clickToolbarButton attribute: "bullet", ->
      assert.blockAttributes([0, 1], ["bulletList", "bullet"])
      clickToolbarButton attribute: "number", ->
        assert.blockAttributes([0, 1], ["numberList", "number"])
        done()
