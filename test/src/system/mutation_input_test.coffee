{assert, defer, test, testGroup, triggerEvent, typeCharacters, clickToolbarButton, isToolbarButtonActive} = Trix.TestHelpers

testGroup "Mutation input", template: "editor_empty", ->
  test "deleting a newline", (expectDocument) ->
    element = getEditorElement()
    element.editor.insertString("a\n\nb")

    triggerEvent(element, "keydown", charCode: 0, keyCode: 229, which: 229)
    br = element.querySelectorAll("br")[1]
    br.parentNode.removeChild(br)
    requestAnimationFrame ->
      expectDocument("a\nb\n")

  test "typing formatted text after a newline at the end of block", (expectDocument) ->
    element = getEditorElement()
    element.editor.insertString("a\n")

    clickToolbarButton attribute: "bold", ->
      # Press B key
      triggerEvent(element, "keydown", charCode: 0, keyCode: 66, which: 66)
      triggerEvent(element, "keypress", charCode: 98, keyCode: 98, which: 98)

      node = document.createTextNode("b")
      extraBR = element.querySelectorAll("br")[1]
      extraBR.parentNode.insertBefore(node, extraBR)
      extraBR.parentNode.removeChild(extraBR)

      requestAnimationFrame ->
        assert.ok isToolbarButtonActive(attribute: "bold")
        assert.textAttributes([0, 2], {})
        assert.textAttributes([2, 3], bold: true)
        assert.textAttributes([3, 4], blockBreak: true)
        expectDocument("a\nb\n")
