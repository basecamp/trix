editorModule "Undo/Redo", template: "editor_empty", ->
  editorTest "typing and undoing", (done) ->
    first = getDocument().copy()
    trix.typeCharacters "abc", ->
      ok not getDocument().isEqualTo(first)
      trix.clickToolbarButton action: "undo", ->
        ok getDocument().isEqualTo(first)
        done()

  editorTest "typing, formatting, typing, and undoing", (done) ->
    first = getDocument().copy()
    trix.typeCharacters "abc", ->
      second = getDocument().copy()
      trix.clickToolbarButton attribute: "bold", ->
        trix.typeCharacters "def", ->
          third = getDocument().copy()
          trix.clickToolbarButton action: "undo", ->
            ok getDocument().isEqualTo(second)
            trix.clickToolbarButton action: "undo", ->
              ok getDocument().isEqualTo(first)
              trix.clickToolbarButton action: "redo", ->
                ok getDocument().isEqualTo(second)
                trix.clickToolbarButton action: "redo", ->
                  ok getDocument().isEqualTo(third)
                  done()

  editorTest "formatting changes are batched by location range", (done) ->
    trix.typeCharacters "abc", ->
      first = getDocument().copy()
      trix.expandSelection "left", ->
        trix.clickToolbarButton attribute: "bold", ->
          trix.clickToolbarButton attribute: "italic", ->
            second = getDocument().copy()
            trix.moveCursor "left", ->
              trix.expandSelection "left", ->
                trix.clickToolbarButton attribute: "italic", ->
                  third = getDocument().copy()
                  trix.clickToolbarButton action: "undo", ->
                    ok getDocument().isEqualTo(second)
                    trix.clickToolbarButton action: "undo", ->
                      ok getDocument().isEqualTo(first)
                      trix.clickToolbarButton action: "redo", ->
                        ok getDocument().isEqualTo(second)
                        trix.clickToolbarButton action: "redo", ->
                          ok getDocument().isEqualTo(third)
                          done()
