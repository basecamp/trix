trix.testGroup "List formatting", template: "editor_empty", ->
  trix.test "creating a new list item", (done) ->
    trix.typeCharacters "a", ->
      trix.clickToolbarButton attribute: "bullet", ->
        trix.typeCharacters "\n", ->
          trix.assert.locationRange(index: 1, offset: 0)
          trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
          trix.assert.blockAttributes([2, 3], ["bulletList", "bullet"])
          done()

  trix.test "breaking out of a list", (expectDocument) ->
    trix.typeCharacters "a", ->
      trix.clickToolbarButton attribute: "bullet", ->
        trix.typeCharacters "\n\n", ->
          trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
          trix.assert.blockAttributes([2, 3], [])
          expectDocument("a\n\n")

  trix.test "pressing return at the beginning of a non-empty list item", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\nb", ->
        trix.moveCursor "left", ->
          trix.pressKey "return", ->
            trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
            trix.assert.blockAttributes([2, 3], ["bulletList", "bullet"])
            trix.assert.blockAttributes([3, 5], ["bulletList", "bullet"])
            expectDocument("a\n\nb\n")

  trix.test "pressing delete at the beginning of a non-empty nested list item", (expectDocument) ->
      trix.clickToolbarButton attribute: "bullet", ->
        trix.typeCharacters "a\n", ->
          trix.clickToolbarButton action: "increaseBlockLevel", ->
            trix.typeCharacters "b\n", ->
              trix.clickToolbarButton action: "increaseBlockLevel", ->
                trix.typeCharacters "c", ->
                  getSelectionManager().setLocationRange(index: 1, offset: 0)
                  getComposition().deleteInDirection("backward")
                  getEditorController().render()
                  trix.defer ->
                    trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
                    trix.assert.blockAttributes([3, 4], ["bulletList", "bullet", "bulletList", "bullet"])
                    expectDocument("ab\nc\n")

  trix.test "decreasing list item's level decreases its nested items level too", (expectDocument) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\n", ->
        trix.clickToolbarButton action: "increaseBlockLevel", ->
          trix.typeCharacters "b\n", ->
            trix.clickToolbarButton action: "increaseBlockLevel", ->
              trix.typeCharacters "c", ->
                getSelectionManager().setLocationRange(index: 1, offset: 1)

                for n in [0...3]
                  getComposition().deleteInDirection("backward")
                  getEditorController().render()

                trix.assert.blockAttributes([0, 2], ["bulletList", "bullet"])
                trix.assert.blockAttributes([2, 3], [])
                trix.assert.blockAttributes([3, 5], ["bulletList", "bullet"])
                expectDocument("a\n\nc\n")
