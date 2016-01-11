editorModule "View caching", template: "editor_empty", ->
  editorTest "reparsing and rendering identical texts", (done) ->
    trix.typeCharacters "a\nb\na", ->
      trix.moveCursor direction: "left", times: 2, ->
        trix.clickToolbarButton attribute: "quote", ->
          html = getEditorElement().innerHTML
          getEditorController().reparse()
          getEditorController().render()
          equal getEditorElement().innerHTML, html
          done()

  editorTest "reparsing and rendering identical blocks", (done) ->
    trix.clickToolbarButton attribute: "bullet", ->
      trix.typeCharacters "a\na", ->
        html = getEditorElement().innerHTML
        getEditorController().reparse()
        getEditorController().render()
        equal getEditorElement().innerHTML, html
        done()
