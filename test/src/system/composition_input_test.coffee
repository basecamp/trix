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

# Simulates the sequence of events when pressing backspace through a word on Android
editorTest "backspacing through a composition", (expectDocument) ->
  element = getEditorElement()
  element.editor.insertString("a cat")

  triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
  triggerEvent(element, "compositionupdate", data: "ca")
  removeCharacters -1, ->
    triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    triggerEvent(element, "compositionupdate", data: "c")
    triggerEvent(element, "compositionend", data: "c")
    removeCharacters -1, ->
      pressKey "backspace", ->
        expectDocument "a \n"

removeCharacters = (direction, callback) ->
  selection = rangy.getSelection()
  range = selection.getRangeAt(0)
  range.moveStart("character", direction)
  range.deleteContents()
  defer(callback)
