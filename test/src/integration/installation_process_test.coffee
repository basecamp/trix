editorModule "Installation process", template: "editor_html"

test "returns an editor controller", ->
  ok window.editor instanceof Trix.EditorController

test "creates a contenteditable element", ->
  ok getEditorElement()
  equal document.getElementById("content").style.display, "none"

test "loads the initial document", ->
  equal getEditorElement().textContent, "Hello world"

test "copies attributes from textarea", ->
  element = getEditorElement()
  equal element.getAttribute("data-placeholder"), "Say hello..."
  equal element.style.minHeight, "33px"


editorModule "Installation process with JSON", template: "editor_json", config: { format: "json" }

test "loads the initial document from input with JSON", ->
  equal getEditorElement().textContent, "Hello JSON"
