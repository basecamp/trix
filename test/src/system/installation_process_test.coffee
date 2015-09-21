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


editorModule "Installation process with specified elements", template: "editor_with_toolbar_and_input"

editorTest "uses specified elements", (done) ->
  editorElement = getEditorElement()
  equal editorElement.toolbarElement, document.getElementById("my_toolbar")
  equal editorElement.inputElement, document.getElementById("my_input")
  equal editorElement.value, "<div>Hello world</div>"
  done()
