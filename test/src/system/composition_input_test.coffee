editorModule "Composition input", template: "editor_empty"

editorTest "composing", (expectDocument) ->
  composeString "abc", ->
    expectDocument "abc\n"

editorTest "typing and composing", (expectDocument) ->
  typeCharacters "a", ->
    composeString "bcd", ->
      typeCharacters "e", ->
        expectDocument "abcde\n"

editorTest "pressing return after a canceled composition", (expectDocument) ->
  typeCharacters "ab", ->
    triggerEvent document.activeElement, "compositionend", data: "ab"
    pressKey "return", ->
      expectDocument "ab\n\n"

editorTest "composing formatted text", (expectDocument) ->
  typeCharacters "abc", ->
    clickToolbarButton attribute: "bold", ->
      composeString "def", ->
        expectAttributes([0, 3], {})
        expectAttributes([3, 6], bold: true)
        expectDocument("abcdef\n")

editorTest "composing away from formatted text", (expectDocument) ->
    clickToolbarButton attribute: "bold", ->
      typeCharacters "abc", ->
        clickToolbarButton attribute: "bold", ->
          composeString "def", ->
            expectAttributes([0, 3], bold: true)
            expectAttributes([3, 6], {})
            expectDocument("abcdef\n")
