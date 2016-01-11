trix.testGroup "View caching", template: "editor_empty", ->
  trix.test "reparsing and rendering identical texts", (done) ->
    trix.typeCharacters "a\nb\na", ->
      trix.moveCursor direction: "left", times: 2, ->
        trix.clickToolbarButton attribute: "quote", ->
          html = getEditorElement().innerHTML
          getEditorController().reparse()
          getEditorController().render()
          trix.assert.equal getEditorElement().innerHTML, html
          done()

  trix.test "reparsing and rendering identical blocks", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\na", ->
        html = getEditorElement().innerHTML
        getEditorController().reparse()
        getEditorController().render()
        trix.assert.equal getEditorElement().innerHTML, html
        done()
