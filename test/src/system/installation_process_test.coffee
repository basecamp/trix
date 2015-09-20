editorModule "Installation process", template: "editor_html"

editorTest "element.editorController", ->
  ok getEditorController() instanceof Trix.EditorController

editorTest "creates a contenteditable element", ->
  ok getEditorElement()

editorTest "loads the initial document", ->
  equal getEditorElement().textContent, "Hello world"

editorTest "sets value property", (done) ->
  defer ->
    equal getEditorElement().value, "<div>Hello world</div>"
    done()
