{assert, clickToolbarButton, defer, endComposition, insertNode, pressKey, selectNode, startComposition, test, testGroup, triggerEvent, typeCharacters, updateComposition} = Trix.TestHelpers

testGroup "Composition input", template: "editor_empty", ->
  test "composing", (expectDocument) ->
    startComposition "a", ->
      updateComposition "ab", ->
        endComposition "abc", ->
          expectDocument "abc\n"

  test "typing and composing", (expectDocument) ->
    typeCharacters "a", ->
      startComposition "b", ->
        updateComposition "bc", ->
          endComposition "bcd", ->
            typeCharacters "e", ->
              expectDocument "abcde\n"

  test "composition input is serialized", (expectDocument) ->
    startComposition "´", ->
      endComposition "é", ->
        assert.equal getEditorElement().value, "<div>é</div>"
        expectDocument "é\n"

  test "pressing return after a canceled composition", (expectDocument) ->
    typeCharacters "ab", ->
      triggerEvent document.activeElement, "compositionend", data: "ab"
      pressKey "return", ->
        expectDocument "ab\n\n"

  test "composing formatted text", (expectDocument) ->
    typeCharacters "abc", ->
      clickToolbarButton attribute: "bold", ->
        startComposition "d", ->
          updateComposition "de", ->
            endComposition "def", ->
              assert.textAttributes([0, 3], {})
              assert.textAttributes([3, 6], bold: true)
              expectDocument("abcdef\n")

  test "composing away from formatted text", (expectDocument) ->
    clickToolbarButton attribute: "bold", ->
      typeCharacters "abc", ->
        clickToolbarButton attribute: "bold", ->
          startComposition "d", ->
            updateComposition "de", ->
              endComposition "def", ->
                assert.textAttributes([0, 3], bold: true)
                assert.textAttributes([3, 6], {})
                expectDocument("abcdef\n")

  test "composing another language using a QWERTY keyboard", (expectDocument) ->
    element = getEditorElement()
    keyCodes = x: 120, i: 105

    triggerEvent(element, "keypress", charCode: keyCodes.x, keyCode: keyCodes.x, which: keyCodes.x)
    startComposition "x", ->
      triggerEvent(element, "keypress", charCode: keyCodes.i, keyCode: keyCodes.i, which: keyCodes.i)
      updateComposition "xi", ->
        endComposition "喜", ->
          expectDocument "喜\n"

  # Simulates the sequence of events when pressing backspace through a word on Android
  test "backspacing through a composition", (expectDocument) ->
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

  # Simulates the sequence of events when pressing backspace at the end of a
  # word and updating it on Android (running older versions of System WebView)
  test "updating a composition", (expectDocument) ->
    element = getEditorElement()
    element.editor.insertString("cat")

    triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    triggerEvent(element, "compositionstart", data: "cat")
    triggerEvent(element, "compositionupdate", data: "cat")
    removeCharacters -1, ->
      triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
      triggerEvent(element, "compositionupdate", data: "car")
      triggerEvent(element, "compositionend", data: "car")
      insertNode document.createTextNode("r"), ->
        expectDocument("car\n")

  # Simulates the sequence of events when typing on Android and then tapping elsewhere
  test "leaving a composition", (expectDocument) ->
    element = getEditorElement()

    triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    triggerEvent(element, "compositionstart", data: "")
    triggerEvent(element, "compositionupdate", data: "c")
    node = document.createTextNode("c")
    insertNode(node)
    defer ->
      triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
      triggerEvent(element, "compositionupdate", data: "ca")
      node.data = "ca"
      defer ->
        triggerEvent(element, "compositionend", data: "")
        defer ->
          expectDocument("ca\n")

  # Simulates compositions in Firefox where the final composition data is
  # dispatched as both compositionupdate and compositionend.
  test "composition ending with same data as last update", (expectDocument) ->
    element = getEditorElement()

    triggerEvent(element, "compositionstart", data: "")
    triggerEvent(element, "compositionupdate", data: "´")
    node = document.createTextNode("´")
    insertNode(node)
    selectNode(node)
    defer ->
      triggerEvent(element, "compositionupdate", data: "é")
      node.data = "é"
      defer ->
        triggerEvent(element, "compositionupdate", data: "éé")
        node.data = "éé"
        defer ->
          triggerEvent(element, "compositionend", data: "éé")
          defer ->
            assert.locationRange(index: 0, offset: 2)
            expectDocument("éé\n")

removeCharacters = (direction, callback) ->
  selection = rangy.getSelection()
  range = selection.getRangeAt(0)
  range.moveStart("character", direction)
  range.deleteContents()
  defer(callback)
