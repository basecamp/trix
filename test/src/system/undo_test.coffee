editorModule "Undo/Redo", template: "editor_empty"

editorTest "typing and undoing", (done) ->
  first = getDocument().copy()
  typeCharacters "abc", ->
    ok not getDocument().isEqualTo(first)
    clickToolbarButton action: "undo", ->
      ok getDocument().isEqualTo(first)
      done()

editorTest "typing, formatting, typing, and undoing", (done) ->
  first = getDocument().copy()
  typeCharacters "abc", ->
    second = getDocument().copy()
    clickToolbarButton attribute: "bold", ->
      typeCharacters "def", ->
        third = getDocument().copy()
        clickToolbarButton action: "undo", ->
          ok getDocument().isEqualTo(second)
          clickToolbarButton action: "undo", ->
            ok getDocument().isEqualTo(first)
            clickToolbarButton action: "redo", ->
              ok getDocument().isEqualTo(second)
              clickToolbarButton action: "redo", ->
                ok getDocument().isEqualTo(third)
                done()

editorTest "formatting changes are batched by location range", (done) ->
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
                  ok getDocument().isEqualTo(second)
                  clickToolbarButton action: "undo", ->
                    ok getDocument().isEqualTo(first)
                    clickToolbarButton action: "redo", ->
                      ok getDocument().isEqualTo(second)
                      clickToolbarButton action: "redo", ->
                        ok getDocument().isEqualTo(third)
                        done()
