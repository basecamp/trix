editorModule "List formatting", template: "editor_empty"

editorTest "creating a new list item", (done) ->
  typeCharacters "a", ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "\n", ->
        assertLocationRange(index: 1, offset: 0)
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

editorTest "pressing delete at the beginning of a non-empty nested list item", (expectDocument) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\n", ->
        clickToolbarButton action: "increaseBlockLevel", ->
          typeCharacters "b\n", ->
            clickToolbarButton action: "increaseBlockLevel", ->
              typeCharacters "c", ->
                getSelectionManager().setLocationRange(index: 1, offset: 0)
                getComposition().deleteInDirection("backward")
                getEditorController().render()
                defer ->
                  expectBlockAttributes([0, 2], ["bulletList", "bullet"])
                  expectBlockAttributes([3, 4], ["bulletList", "bullet", "bulletList", "bullet"])
                  expectDocument("ab\nc\n")

editorTest "decreasing list item's level decreases its nested items level too", (expectDocument) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "a\n", ->
      clickToolbarButton action: "increaseBlockLevel", ->
        typeCharacters "b\n", ->
          clickToolbarButton action: "increaseBlockLevel", ->
            typeCharacters "c", ->
              getSelectionManager().setLocationRange(index: 1, offset: 1)

              for n in [0...3]
                getComposition().deleteInDirection("backward")
                getEditorController().render()

              expectBlockAttributes([0, 2], ["bulletList", "bullet"])
              expectBlockAttributes([2, 3], [])
              expectBlockAttributes([3, 5], ["bulletList", "bullet"])
              expectDocument("a\n\nc\n")
