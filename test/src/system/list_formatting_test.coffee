editorModule "List formatting", template: "editor_empty"

editorTest "creating a new list item", (done) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "\n", ->
        assertLocationRange([1,0])
        expectBlockAttributes([0, 2], bullet: true)
        expectBlockAttributes([2, 3], bullet: true)
        done()

editorTest "breaking out of a list", (expectDocument) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "\n\n", ->
        expectBlockAttributes([0, 2], bullet: true)
        expectBlockAttributes([2, 3], {})
        expectDocument("a\n\n")
