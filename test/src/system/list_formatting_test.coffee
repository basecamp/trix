editorModule "List formatting", template: "editor_empty"

editorTest "creating a new list item", (done) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "\n", ->
        assertLocationRange([1,0])
        expectBlockAttributes([0, 2], ["bulletList", "bullet"])
        expectBlockAttributes([2, 3], ["bulletList", "bullet"])
        done()

editorTest "breaking out of a list", (expectDocument) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "\n\n", ->
        expectBlockAttributes([0, 2], ["bulletList", "bullet"])
        expectBlockAttributes([2, 3], [])
        expectDocument("a\n\n")

editorTest "pressing return at the beginning of a non-empty list item", (expectDocument) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "a\nb", ->
      moveCursor "left", ->
        pressKey "return", ->
          expectBlockAttributes([0, 2], ["bulletList", "bullet"])
          expectBlockAttributes([2, 3], ["bulletList", "bullet"])
          expectBlockAttributes([3, 5], ["bulletList", "bullet"])
          expectDocument("a\n\nb\n")
