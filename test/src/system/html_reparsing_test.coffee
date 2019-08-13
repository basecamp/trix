{assert, test, testGroup} = Trix.TestHelpers

testGroup "HTML Reparsing", template: "editor_empty", ->
  test "mutation resulting in identical blocks", (expectDocument) ->
    element = getEditorElement()
    element.editor.loadHTML("<ul><li>a</li><li>b</li></ul>")
    requestAnimationFrame ->
      element.querySelector("li").textContent = "b"
      requestAnimationFrame ->
        assert.blockAttributes([0, 1], ["bulletList", "bullet"])
        assert.blockAttributes([2, 3], ["bulletList", "bullet"])
        assert.equal(element.value, "<ul><li>b</li><li>b</li></ul>")
        expectDocument("b\nb\n")

  test "mutation resulting in identical pieces", (expectDocument) ->
    element = getEditorElement()
    element.editor.loadHTML("<div><strong>a</strong> <strong>b</strong></div>")
    requestAnimationFrame ->
      element.querySelector("strong").textContent = "b"
      requestAnimationFrame ->
        assert.textAttributes([0, 1], bold: true)
        assert.textAttributes([2, 3], bold: true)
        assert.equal(element.value, "<div><strong>b</strong> <strong>b</strong></div>")
        expectDocument("b b\n")
