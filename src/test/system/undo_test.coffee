{assert, clickToolbarButton, expandSelection, moveCursor, test, testGroup, typeCharacters} = Trix.TestHelpers

testGroup "Undo/Redo", template: "editor_empty", ->
  test "typing and undoing", (done) ->
    first = getDocument().copy()
    typeCharacters "abc", ->
      assert.notOk getDocument().isEqualTo(first)
      clickToolbarButton action: "undo", ->
        assert.ok getDocument().isEqualTo(first)
        done()

  test "typing, formatting, typing, and undoing", (done) ->
    first = getDocument().copy()
    typeCharacters "abc", ->
      second = getDocument().copy()
      clickToolbarButton attribute: "bold", ->
        typeCharacters "def", ->
          third = getDocument().copy()
          clickToolbarButton action: "undo", ->
            assert.ok getDocument().isEqualTo(second)
            clickToolbarButton action: "undo", ->
              assert.ok getDocument().isEqualTo(first)
              clickToolbarButton action: "redo", ->
                assert.ok getDocument().isEqualTo(second)
                clickToolbarButton action: "redo", ->
                  assert.ok getDocument().isEqualTo(third)
                  done()

  test "formatting changes are batched by location range", (done) ->
    typeCharacters "abc", ->
      first = getDocument().copy()
      expandSelection "left", ->
        clickToolbarButton attribute: "bold", ->
          clickToolbarButton attribute: "italic", ->
            second = getDocument().copy()
            moveCursor "left", ->
              expandSelection "left", ->
                clickToolbarButton attribute: "italic", ->
                  third = getDocument().copy()
                  clickToolbarButton action: "undo", ->
                    assert.ok getDocument().isEqualTo(second)
                    clickToolbarButton action: "undo", ->
                      assert.ok getDocument().isEqualTo(first)
                      clickToolbarButton action: "redo", ->
                        assert.ok getDocument().isEqualTo(second)
                        clickToolbarButton action: "redo", ->
                          assert.ok getDocument().isEqualTo(third)
                          done()

  test "block formatting are undoable", (done) ->
    typeCharacters "abc", ->
      first = getDocument().copy()
      clickToolbarButton attribute: "heading1", ->
        second = getDocument().copy()
        clickToolbarButton action: "undo", ->
          assert.ok getDocument().isEqualTo(first)
          clickToolbarButton action: "redo", ->
            assert.ok getDocument().isEqualTo(second)
            done()
