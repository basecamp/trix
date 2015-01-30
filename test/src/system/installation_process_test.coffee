editorModule "Installation process", template: "editor_html", config:
  className: "one two three"

test "returns an editor controller", ->
  ok window.editor instanceof Trix.EditorController

test "creates a contenteditable element", ->
  ok getDocumentElement()
  equal document.getElementById("content").style.display, "none"

test "loads the initial document", ->
  equal getDocumentElement().textContent, "Hello world"

test "copies attributes from textarea", ->
  element = getDocumentElement()
  equal element.getAttribute("data-placeholder"), "Say hello..."
  equal element.style.minHeight, "33px"

test "sets class names", ->
  element = getDocumentElement()
  classNames = element.className.split(" ").sort()
  deepEqual classNames, ["one", "three", "trix-editor", "two"]

editorModule "Installation process", template: "editor_json", config: { format: "json" }

test "loads the initial document from input with JSON", ->
  equal getDocumentElement().textContent, "Hello JSON"
