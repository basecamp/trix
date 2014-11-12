editorModule "Basic input", template: "editor_empty"

editorTest "typing", (expectDocument) ->
  typeCharacters "foo", ->
    expectDocument "foo\n"

editorTest "backspacing", (expectDocument) ->
  typeCharacters "abc\b", ->
    expectDocument "ab\n"

editorTest "pressing return", (expectDocument) ->
  typeCharacters "ab\rc", ->
    expectDocument "ab\nc\n"

editorTest "cursor left", (expectDocument) ->
  typeCharacters "ac", ->
    moveCursor "left", ->
      typeCharacters "b", ->
        expectDocument "abc\n"

editorTest "replace entire document", (expectDocument) ->
  typeCharacters "abc", ->
    selectAll ->
      typeCharacters "d", ->
        expectDocument "d\n"

editorTest "remove entire document", (expectDocument) ->
  typeCharacters "abc", ->
    selectAll ->
      typeCharacters "\b", ->
        expectDocument "\n"

editorTest "paste plain text", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      pasteContent "text/plain", "!", ->
        expectDocument "ab!c\n"

editorTest "paste html", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor "left", ->
      pasteContent "text/html", "&lt;", ->
        expectDocument "ab<c\n"

editorTest "paste file", (expectDocument) ->
  pasteContent "Files", (createFile()), ->
    expectDocument "#{Trix.AttachmentPiece.OBJECT_REPLACEMENT_CHARACTER}\n"

editorTest "content mutation", (expectDocument) ->
  typeCharacters "abc", ->
    textNode = document.createTextNode("hi")
    document.activeElement.appendChild(textNode)
    after 50, ->
      expectDocument "abchi\n"

editorTest "drag text", (expectDocument) ->
  typeCharacters "abc", ->
    moveCursor direction: "left", times: 2, (coordinates) ->
      moveCursor "right", ->
        expandSelection "right", ->
          dragToCoordinates coordinates, ->
            expectDocument "acb\n"

