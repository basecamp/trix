trix.testGroup "Composition input", template: "editor_empty", ->
  trix.test "composing", (expectDocument) ->
    trix.startComposition "a", ->
      trix.updateComposition "ab", ->
        trix.endComposition "abc", ->
          expectDocument "abc\n"

  trix.test "typing and composing", (expectDocument) ->
    trix.typeCharacters "a", ->
      trix.startComposition "b", ->
        trix.updateComposition "bc", ->
          trix.endComposition "bcd", ->
            trix.typeCharacters "e", ->
              expectDocument "abcde\n"

  trix.test "pressing return after a canceled composition", (expectDocument) ->
    trix.typeCharacters "ab", ->
      trix.triggerEvent document.activeElement, "compositionend", data: "ab"
      trix.pressKey "return", ->
        expectDocument "ab\n\n"

  trix.test "composing formatted text", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.clickToolbarButton attribute: "bold", ->
        trix.startComposition "d", ->
          trix.updateComposition "de", ->
            trix.endComposition "def", ->
              expectAttributes([0, 3], {})
              expectAttributes([3, 6], bold: true)
              expectDocument("abcdef\n")

  trix.test "composing away from formatted text", (expectDocument) ->
    trix.clickToolbarButton attribute: "bold", ->
      trix.typeCharacters "abc", ->
        trix.clickToolbarButton attribute: "bold", ->
          trix.startComposition "d", ->
            trix.updateComposition "de", ->
              trix.endComposition "def", ->
                expectAttributes([0, 3], bold: true)
                expectAttributes([3, 6], {})
                expectDocument("abcdef\n")

  trix.test "composing another language using a QWERTY keyboard", (expectDocument) ->
    element = getEditorElement()
    keyCodes = x: 120, i: 105

    trix.triggerEvent(element, "keypress", charCode: keyCodes.x, keyCode: keyCodes.x, which: keyCodes.x)
    trix.startComposition "x", ->
      trix.triggerEvent(element, "keypress", charCode: keyCodes.i, keyCode: keyCodes.i, which: keyCodes.i)
      trix.updateComposition "xi", ->
        trix.endComposition "喜", ->
          expectDocument "喜\n"

  # Simulates the sequence of events when pressing backspace through a word on Android
  trix.test "backspacing through a composition", (expectDocument) ->
    element = getEditorElement()
    element.editor.insertString("a cat")

    trix.triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    trix.triggerEvent(element, "compositionupdate", data: "ca")
    removeCharacters -1, ->
      trix.triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
      trix.triggerEvent(element, "compositionupdate", data: "c")
      trix.triggerEvent(element, "compositionend", data: "c")
      removeCharacters -1, ->
        trix.pressKey "backspace", ->
          expectDocument "a \n"

removeCharacters = (direction, callback) ->
  selection = rangy.getSelection()
  range = selection.getRangeAt(0)
  range.moveStart("character", direction)
  range.deleteContents()
  trix.defer(callback)
