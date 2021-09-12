{assert, clickToolbarButton, defer, moveCursor, pressKey, test, testIf, testGroup, triggerEvent, typeCharacters} = Trix.TestHelpers

testGroup "List formatting", template: "editor_empty", ->
  test "creating a new list item", (done) ->
    typeCharacters "a", ->
      clickToolbarButton attribute: "bullet", ->
        typeCharacters "\n", ->
          assert.locationRange(index: 1, offset: 0)
          assert.blockAttributes([0, 2], ["bulletList", "bullet"])
          assert.blockAttributes([2, 3], ["bulletList", "bullet"])
          done()

  test "breaking out of a list", (expectDocument) ->
    typeCharacters "a", ->
      clickToolbarButton attribute: "bullet", ->
        typeCharacters "\n\n", ->
          assert.blockAttributes([0, 2], ["bulletList", "bullet"])
          assert.blockAttributes([2, 3], [])
          expectDocument("a\n\n")

  test "pressing return at the beginning of a non-empty list item", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\nb", ->
        moveCursor "left", ->
          pressKey "return", ->
            assert.blockAttributes([0, 2], ["bulletList", "bullet"])
            assert.blockAttributes([2, 3], ["bulletList", "bullet"])
            assert.blockAttributes([3, 5], ["bulletList", "bullet"])
            expectDocument("a\n\nb\n")

  test "pressing tab increases nesting level, tab+shift decreases nesting level", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a", ->
        pressKey "return", ->
          pressKey "tab", ->
            typeCharacters "b", ->
              assert.blockAttributes([0, 1], ["bulletList", "bullet"])
              assert.blockAttributes([2, 3], ["bulletList", "bullet", "bulletList", "bullet"])
              defer ->
                pressShiftTab = triggerEvent(document.activeElement, "keydown", key: "Tab", charCode: 0, keyCode: 9, which: 9, shiftKey: true)
                assert.blockAttributes([0, 1], ["bulletList", "bullet"])
                assert.blockAttributes([2, 3], ["bulletList", "bullet"])
                expectDocument("a\nb\n")

  testIf Trix.config.input.getLevel() is 0, "pressing shift-return at the end of a list item", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a", ->
        pressShiftReturn = triggerEvent(document.activeElement, "keydown", charCode: 0, keyCode: 13, which: 13, shiftKey: true)
        assert.notOk pressShiftReturn # Assert defaultPrevented
        assert.blockAttributes([0, 2], ["bulletList", "bullet"])
        expectDocument("a\n\n")

  test "pressing delete at the beginning of a non-empty nested list item", (expectDocument) ->
      clickToolbarButton attribute: "bullet", ->
        typeCharacters "a\n", ->
          clickToolbarButton action: "increaseNestingLevel", ->
            typeCharacters "b\n", ->
              clickToolbarButton action: "increaseNestingLevel", ->
                typeCharacters "c", ->
                  getSelectionManager().setLocationRange(index: 1, offset: 0)
                  getComposition().deleteInDirection("backward")
                  getEditorController().render()
                  defer ->
                    assert.blockAttributes([0, 2], ["bulletList", "bullet"])
                    assert.blockAttributes([3, 4], ["bulletList", "bullet", "bulletList", "bullet"])
                    expectDocument("ab\nc\n")

  test "decreasing list item's level decreases its nested items level too", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\n", ->
        clickToolbarButton action: "increaseNestingLevel", ->
          typeCharacters "b\n", ->
            clickToolbarButton action: "increaseNestingLevel", ->
              typeCharacters "c", ->
                getSelectionManager().setLocationRange(index: 1, offset: 1)

                for n in [0...3]
                  getComposition().deleteInDirection("backward")
                  getEditorController().render()

                assert.blockAttributes([0, 2], ["bulletList", "bullet"])
                assert.blockAttributes([2, 3], [])
                assert.blockAttributes([3, 5], ["bulletList", "bullet"])
                expectDocument("a\n\nc\n")
