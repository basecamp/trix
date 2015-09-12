editorModule "Installation process", template: "editor_html"

editorTest "element.editorController", ->
  ok getEditorController() instanceof Trix.EditorController

editorTest "creates a contenteditable element", ->
  ok getDocumentElement()

editorTest "loads the initial document", ->
  equal getDocumentElement().textContent, "Hello world"

editorTest "sets value attribute", (done) ->
  defer ->
    equal getEditorElement().getAttribute("value"), "<div>Hello world</div>"
    done()

editorModule "Installation process", template: "editor_json"

editorTest "loads the initial document from input with JSON", ->
  equal getDocumentElement().textContent, "Hello JSON"
