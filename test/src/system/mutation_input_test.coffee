{assert, defer, test, testGroup, triggerEvent, typeCharacters} = Trix.TestHelpers

testGroup "Mutation input", template: "editor_empty", ->
  test "deleting a newline", (expectDocument) ->
    element = getEditorElement()
    element.editor.insertString("a\n\nb")

    triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    br = element.querySelectorAll("br")[1]
    br.parentNode.removeChild(br)
    requestAnimationFrame ->
      expectDocument("a\nb\n")
