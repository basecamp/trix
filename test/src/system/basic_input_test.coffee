trix.testGroup "Basic input", template: "editor_empty", ->
  trix.test "typing", (expectDocument) ->
    trix.typeCharacters "abc", ->
      expectDocument "abc\n"

  trix.test "backspacing", (expectDocument) ->
    trix.typeCharacters "abc\b", ->
      assertLocationRange(index: 0, offset: 2)
      expectDocument "ab\n"

  trix.test "pressing delete", (expectDocument) ->
    trix.typeCharacters "ab", ->
      trix.moveCursor "left", ->
        trix.pressKey "delete", ->
          expectDocument "a\n"

  trix.test "pressing return", (expectDocument) ->
    trix.typeCharacters "ab", ->
      trix.pressKey "return", ->
        trix.typeCharacters "c", ->
          expectDocument "ab\nc\n"

  trix.test "cursor left", (expectDocument) ->
    trix.typeCharacters "ac", ->
      trix.moveCursor "left", ->
        trix.typeCharacters "b", ->
          expectDocument "abc\n"

  trix.test "replace entire document", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.selectAll ->
        trix.typeCharacters "d", ->
          expectDocument "d\n"

  trix.test "remove entire document", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.selectAll ->
        trix.typeCharacters "\b", ->
          expectDocument "\n"

  trix.test "drag text", (expectDocument) ->
    trix.typeCharacters "abc", ->
      trix.moveCursor direction: "left", times: 2, (coordinates) ->
        trix.moveCursor "right", ->
          trix.expandSelection "right", ->
            trix.dragToCoordinates coordinates, ->
              expectDocument "acb\n"

  trix.test "inserting newline after cursor (control + o)", (expectDocument) ->
    trix.typeCharacters "ab", ->
      trix.moveCursor "left", ->
        trix.triggerEvent(document.activeElement, "keydown", charCode: 0, keyCode: 79, which: 79, ctrlKey: true)
        trix.defer ->
          assertLocationRange index: 0, offset: 1
          expectDocument "a\nb\n"

  trix.test "inserting ó with control + alt + o (AltGr)", (expectDocument) ->
    trix.typeCharacters "ab", ->
      trix.moveCursor "left", ->
        if trix.triggerEvent(document.activeElement, "keydown", charCode: 0, keyCode: 79, which: 79, altKey: true, ctrlKey: true)
          trix.triggerEvent(document.activeElement, "keypress", charCode: 243, keyCode: 243, which: 243, altKey: true, ctrlKey: true)
          trix.insertNode(document.createTextNode("ó"))

        trix.defer ->
          assertLocationRange index: 0, offset: 2
          expectDocument "aób\n"
