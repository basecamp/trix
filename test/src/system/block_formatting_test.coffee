{assert, clickToolbarButton, defer, expandSelection, isToolbarButtonActive, isToolbarButtonDisabled, moveCursor, pressKey, replaceDocument, selectAll, test, testGroup, typeCharacters} = Trix.TestHelpers

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
        new Trix.Block(Trix.Text.textForStringWithAttributes("1"), ["bulletList", "bullet"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("2"), ["bulletList", "bullet"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("3"), ["bulletList", "bullet"])
      ]

    replaceDocument(document)
    getEditorController().setLocationRange([{index: 0, offset: 0}, {index: 5, offset: 1}])
    defer ->
      clickToolbarButton attribute: "quote", ->
        assert.blockAttributes([0, 2], ["bulletList", "bullet", "quote"])
        assert.blockAttributes([2, 8], ["quote"])
        assert.blockAttributes([8, 10], ["bulletList", "bullet", "quote"])
        assert.blockAttributes([10, 12], ["bulletList", "bullet", "quote"])
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

  test "breaking out of a formatted block with adjacent non-formatted blocks", (expectDocument) ->
    # * = cursor
    #
    # a
    # b*
    # c
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), ["quote"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(3)

    typeCharacters "\n\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 4
      assert.blockAttributes([0, 1], [])
      assert.blockAttributes([2, 3], ["quote"])
      assert.blockAttributes([4, 5], [])
      assert.blockAttributes([5, 6], [])
      expectDocument("a\nb\n\nc\n")

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
      clickToolbarButton action: "increaseNestingLevel", ->
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
        clickToolbarButton action: "increaseNestingLevel", ->
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
        clickToolbarButton action: "increaseNestingLevel", ->
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
    assert.ok isToolbarButtonDisabled(action: "increaseNestingLevel")
    assert.ok isToolbarButtonDisabled(action: "decreaseNestingLevel")
    clickToolbarButton attribute: "bullet", ->
      assert.ok isToolbarButtonDisabled(action: "increaseNestingLevel")
      assert.notOk isToolbarButtonDisabled(action: "decreaseNestingLevel")
      typeCharacters "a\n", ->
        assert.notOk isToolbarButtonDisabled(action: "increaseNestingLevel")
        assert.notOk isToolbarButtonDisabled(action: "decreaseNestingLevel")
        clickToolbarButton action: "increaseNestingLevel", ->
          typeCharacters "b", ->
            assert.ok isToolbarButtonDisabled(action: "increaseNestingLevel")
            assert.notOk isToolbarButtonDisabled(action: "decreaseNestingLevel")
            assert.blockAttributes([0, 2], ["bulletList", "bullet"])
            assert.blockAttributes([2, 4], ["bulletList", "bullet", "bulletList", "bullet"])
            done()

  test "changing list type", (done) ->
    clickToolbarButton attribute: "bullet", ->
      assert.blockAttributes([0, 1], ["bulletList", "bullet"])
      clickToolbarButton attribute: "number", ->
        assert.blockAttributes([0, 1], ["numberList", "number"])
        done()

  test "adding bullet to heading block", (done) ->
    clickToolbarButton attribute: "heading1", ->
      clickToolbarButton attribute: "bullet", ->
        assert.ok isToolbarButtonActive(attribute: "heading1")
        assert.blockAttributes([1, 2], [])
        done()

  test "removing bullet from heading block", (done) ->
    clickToolbarButton attribute: "bullet", ->
      clickToolbarButton attribute: "heading1", ->
        assert.ok isToolbarButtonDisabled(attribute: "bullet")
        done()

  test "breaking out of heading in list", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      clickToolbarButton attribute: "heading1", ->
        assert.ok isToolbarButtonActive(attribute: "heading1")
        typeCharacters "abc", ->
          typeCharacters "\n", ->
            assert.ok isToolbarButtonActive(attribute: "bullet")
            document = getDocument()
            assert.equal document.getBlockCount(), 2
            assert.blockAttributes([0, 4], ["bulletList", "bullet", "heading1"])
            assert.blockAttributes([4, 5], ["bulletList", "bullet"])
            expectDocument("abc\n\n")

  test "breaking out of middle of heading block", (expectDocument) ->
    clickToolbarButton attribute: "heading1", ->
      typeCharacters "abc", ->
        assert.ok isToolbarButtonActive(attribute: "heading1")
        moveCursor direction: "left", times: 1, ->
          typeCharacters "\n", ->
            document = getDocument()
            assert.equal document.getBlockCount(), 2
            assert.blockAttributes([0, 3], ["heading1"])
            assert.blockAttributes([3, 4], ["heading1"])
            expectDocument("ab\nc\n")

  test "breaking out of middle of heading block with preceding blocks", (expectDocument) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), ["heading1"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("cd"), ["heading1"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(5)
    assert.ok isToolbarButtonActive(attribute: "heading1")

    typeCharacters "\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 4
      assert.blockAttributes([0, 1], ["heading1"])
      assert.blockAttributes([2, 3], [])
      assert.blockAttributes([4, 5], ["heading1"])
      assert.blockAttributes([6, 7], ["heading1"])
      expectDocument("a\nb\nc\nd\n")

  test "breaking out of end of heading block with preceding blocks", (expectDocument) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), ["heading1"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("cd"), ["heading1"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(6)
    assert.ok isToolbarButtonActive(attribute: "heading1")

    typeCharacters "\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 4
      assert.blockAttributes([0, 1], ["heading1"])
      assert.blockAttributes([2, 3], [])
      assert.blockAttributes([4, 6], ["heading1"])
      assert.blockAttributes([7, 8], [])
      expectDocument("a\nb\ncd\n\n")

  test "inserting newline before heading", (done) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("\n"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("abc"), ["heading1"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(0)

    typeCharacters "\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 2

      block = document.getBlockAtIndex(0)
      assert.deepEqual block.getAttributes(), []
      assert.equal block.toString(), "\n\n\n"

      block = document.getBlockAtIndex(1)
      assert.deepEqual block.getAttributes(), ["heading1"]
      assert.equal block.toString(), "abc\n"

      done()

  test "inserting multiple newlines before heading", (done) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("\n"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("abc"), ["heading1"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(0)

    typeCharacters "\n\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 2

      block = document.getBlockAtIndex(0)
      assert.deepEqual block.getAttributes(), []
      assert.equal block.toString(), "\n\n\n\n"

      block = document.getBlockAtIndex(1)
      assert.deepEqual block.getAttributes(), ["heading1"]
      assert.equal block.toString(), "abc\n"
      done()

  test "inserting multiple newlines before formatted block", (expectDocument) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("\n"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("abc"), ["quote"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(1)

    typeCharacters "\n\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 2
      assert.blockAttributes([0, 1], [])
      assert.blockAttributes([2, 3], [])
      assert.blockAttributes([4, 6], ["quote"])
      assert.locationRange(index: 0, offset: 3)
      expectDocument("\n\n\n\nabc\n")

  test "inserting newline after heading with text in following block", (expectDocument) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("ab"), ["heading1"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("cd"), [])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(2)

    typeCharacters "\n", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 3
      assert.blockAttributes([0, 2], ["heading1"])
      assert.blockAttributes([3, 4], [])
      assert.blockAttributes([5, 6], [])
      expectDocument("ab\n\ncd\n")

  test "backspacing a newline in an empty block with adjacent formatted blocks", (expectDocument) ->
    document = new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("abc"), ["heading1"])
        new Trix.Block
        new Trix.Block(Trix.Text.textForStringWithAttributes("d"), ["heading1"])
      ]

    replaceDocument(document)
    getEditor().setSelectedRange(4)

    pressKey "backspace", ->
      document = getDocument()
      assert.equal document.getBlockCount(), 2
      assert.blockAttributes([0, 1], ["heading1"])
      assert.blockAttributes([2, 3], ["heading1"])
      expectDocument("abc\nd\n")

  test "backspacing a newline at beginning of non-formatted block", (expectDocument) ->
     document = new Trix.Document [
         new Trix.Block(Trix.Text.textForStringWithAttributes("ab"), ["heading1"])
         new Trix.Block(Trix.Text.textForStringWithAttributes("\ncd"), [])
       ]

     replaceDocument(document)
     getEditor().setSelectedRange(3)

     pressKey "backspace", ->
       document = getDocument()
       assert.equal document.getBlockCount(), 2
       assert.blockAttributes([0, 2], ["heading1"])
       assert.blockAttributes([3, 5], [])
       expectDocument("ab\ncd\n")

  test "inserting newline after single character header", (expectDocument) ->
    clickToolbarButton attribute: "heading1", ->
      typeCharacters "a", ->
        typeCharacters "\n", ->
          document = getDocument()
          assert.equal document.getBlockCount(), 2
          assert.blockAttributes([0, 1], ["heading1"])
          expectDocument("a\n\n")

  test "terminal attributes are only added once", (expectDocument) ->
    replaceDocument new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), ["heading1"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
      ]

    selectAll ->
      clickToolbarButton attribute: "heading1", ->
        assert.equal getDocument().getBlockCount(), 3
        assert.blockAttributes([0, 1], ["heading1"])
        assert.blockAttributes([2, 3], ["heading1"])
        assert.blockAttributes([4, 5], ["heading1"])
        expectDocument("a\nb\nc\n")

  test "terminal attributes replace existing terminal attributes", (expectDocument) ->
    replaceDocument new Trix.Document [
        new Trix.Block(Trix.Text.textForStringWithAttributes("a"), [])
        new Trix.Block(Trix.Text.textForStringWithAttributes("b"), ["heading1"])
        new Trix.Block(Trix.Text.textForStringWithAttributes("c"), [])
      ]

    selectAll ->
      clickToolbarButton attribute: "code", ->
        assert.equal getDocument().getBlockCount(), 3
        assert.blockAttributes([0, 1], ["code"])
        assert.blockAttributes([2, 3], ["code"])
        assert.blockAttributes([4, 5], ["code"])
        expectDocument("a\nb\nc\n")

  test "code blocks preserve newlines", (expectDocument) ->
    typeCharacters "a\nb", ->
      selectAll ->
        clickToolbarButton attribute: "code", ->
          assert.equal getDocument().getBlockCount(), 1
          assert.blockAttributes([0, 3], ["code"])
          expectDocument("a\nb\n")

  test "code blocks are not indentable", (done) ->
    clickToolbarButton attribute: "code", ->
      assert.notOk isToolbarButtonActive(action: "increaseNestingLevel")
      done()

  test "code blocks are terminal", (done) ->
    clickToolbarButton attribute: "code", ->
      assert.ok isToolbarButtonDisabled(attribute: "quote")
      assert.ok isToolbarButtonDisabled(attribute: "heading1")
      assert.ok isToolbarButtonDisabled(attribute: "bullet")
      assert.ok isToolbarButtonDisabled(attribute: "number")
      assert.notOk isToolbarButtonDisabled(attribute: "code")
      assert.notOk isToolbarButtonDisabled(attribute: "bold")
      assert.notOk isToolbarButtonDisabled(attribute: "italic")
      done()

  test "unindenting a code block inside a bullet", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      clickToolbarButton attribute: "code", ->
        typeCharacters "a", ->
          clickToolbarButton action: "decreaseNestingLevel", ->
            document = getDocument()
            assert.equal document.getBlockCount(), 1
            assert.blockAttributes([0, 1], ["code"])
            expectDocument("a\n")

  test "indenting a heading inside a bullet", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a", ->
        typeCharacters "\n", ->
          clickToolbarButton attribute: "heading1", ->
            typeCharacters "b", ->
              clickToolbarButton action: "increaseNestingLevel", ->
                document = getDocument()
                assert.equal document.getBlockCount(), 2
                assert.blockAttributes([0, 1], ["bulletList", "bullet"])
                assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet", "heading1"])
                expectDocument("a\nb\n")

  test "indenting a quote inside a bullet", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      clickToolbarButton attribute: "quote", ->
        clickToolbarButton action: "increaseNestingLevel", ->
          document = getDocument()
          assert.equal document.getBlockCount(), 1
          assert.blockAttributes([0, 1], ["bulletList", "bullet", "quote", "quote"])
          expectDocument("\n")

  test "list indentation constraints consider the list type", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\n\n", ->
        clickToolbarButton attribute: "number", ->
          clickToolbarButton action: "increaseNestingLevel", ->
            document = getDocument()
            assert.equal document.getBlockCount(), 2
            assert.blockAttributes([0, 1], ["bulletList", "bullet"])
            assert.blockAttributes([2, 3], ["numberList", "number"])
            expectDocument("a\n\n")
