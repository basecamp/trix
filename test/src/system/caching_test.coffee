editorModule "View caching", template: "editor_empty"

editorTest "reparsing and rendering identical texts", (done) ->
  typeCharacters "a\nb\na", ->
    moveCursor direction: "left", times: 2, ->
      clickToolbarButton attribute: "quote", ->
        html = getEditorElement().innerHTML
        getEditorController().reparse()
        getEditorController().render()
        equal getEditorElement().innerHTML, html
        done()

editorTest "reparsing and rendering identical blocks", (done) ->
  clickToolbarButton attribute: "bullet", ->
    typeCharacters "a\na", ->
      html = getEditorElement().innerHTML
      getEditorController().reparse()
      getEditorController().render()
      equal getEditorElement().innerHTML, html
      done()
