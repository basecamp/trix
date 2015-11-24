editorModule "Composition input", template: "editor_empty"

editorTest "composing", (expectDocument) ->
  startComposition "a", ->
    updateComposition "ab", ->
      endComposition "abc", ->
        expectDocument "abc\n"

editorTest "typing and composing", (expectDocument) ->
  typeCharacters "a", ->
    startComposition "b", ->
      updateComposition "bc", ->
        endComposition "bcd", ->
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
      startComposition "d", ->
        updateComposition "de", ->
          endComposition "def", ->
            expectAttributes([0, 3], {})
            expectAttributes([3, 6], bold: true)
            expectDocument("abcdef\n")

editorTest "composing away from formatted text", (expectDocument) ->
  clickToolbarButton attribute: "bold", ->
    typeCharacters "abc", ->
      clickToolbarButton attribute: "bold", ->
        startComposition "d", ->
          updateComposition "de", ->
            endComposition "def", ->
              expectAttributes([0, 3], bold: true)
              expectAttributes([3, 6], {})
              expectDocument("abcdef\n")

editorTest "composing another language using a QWERTY keyboard", (expectDocument) ->
  element = getEditorElement()
  keyCodes = x: 120, i: 105

  triggerEvent(element, "keypress", charCode: keyCodes.x, keyCode: keyCodes.x, which: keyCodes.x)
  startComposition "x", ->
    triggerEvent(element, "keypress", charCode: keyCodes.i, keyCode: keyCodes.i, which: keyCodes.i)
    updateComposition "xi", ->
      endComposition "喜", ->
        expectDocument "喜\n"
