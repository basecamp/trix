{assert, clickToolbarButton, moveCursor, test, testGroup, typeCharacters} = Trix.TestHelpers

testGroup "View caching", template: "editor_empty", ->
  test "reparsing and rendering identical texts", (done) ->
    typeCharacters "a\nb\na", ->
      moveCursor direction: "left", times: 2, ->
        clickToolbarButton attribute: "quote", ->
          html = getEditorElement().innerHTML
          getEditorController().reparse()
          getEditorController().render()
          assert.equal getEditorElement().innerHTML, html
          done()

  test "reparsing and rendering identical blocks", (done) ->
    clickToolbarButton attribute: "bullet", ->
      typeCharacters "a\na", ->
        html = getEditorElement().innerHTML
        getEditorController().reparse()
        getEditorController().render()
        assert.equal getEditorElement().innerHTML, html
        done()
