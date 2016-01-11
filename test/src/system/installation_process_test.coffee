trix.testGroup "Installation process", template: "editor_html", ->
  trix.test "element.editorController", ->
    ok getEditorController() instanceof Trix.EditorController

  trix.test "creates a contenteditable element", ->
    ok getEditorElement()

  trix.test "loads the initial document", ->
    equal getEditorElement().textContent, "Hello world"

  trix.test "sets value property", (done) ->
    trix.defer ->
      equal getEditorElement().value, "<div>Hello world</div>"
      done()


trix.testGroup "Installation process without specified elements", template: "editor_empty", ->
  trix.test "creates identified toolbar and input elements", (done) ->
    editorElement = getEditorElement()

    toolbarId = editorElement.getAttribute("toolbar")
    ok /trix-toolbar-\d+/.test(toolbarId), "toolbar id not ok #{JSON.stringify(toolbarId)}"
    toolbarElement = document.getElementById(toolbarId)
    ok toolbarElement, "toolbar element not ok"
    equal editorElement.toolbarElement, toolbarElement

    inputId = editorElement.getAttribute("input")
    ok /trix-input-\d+/.test(inputId), "input id not ok #{JSON.stringify(inputId)}"
    inputElement = document.getElementById(inputId)
    ok inputElement, "input element not ok"
    equal editorElement.inputElement, inputElement

    done()


trix.testGroup "Installation process with specified elements", template: "editor_with_toolbar_and_input", ->
  trix.test "uses specified elements", (done) ->
    editorElement = getEditorElement()
    equal editorElement.toolbarElement, document.getElementById("my_toolbar")
    equal editorElement.inputElement, document.getElementById("my_input")
    equal editorElement.value, "<div>Hello world</div>"
    done()

  trix.test "can be cloned", (done) ->
    originalElement = document.getElementById("my_editor")
    clonedElement = originalElement.cloneNode(true)

    {parentElement} = originalElement
    parentElement.removeChild(originalElement)
    parentElement.appendChild(clonedElement)

    trix.defer ->
      editorElement = getEditorElement()
      equal editorElement.toolbarElement, document.getElementById("my_toolbar")
      equal editorElement.inputElement, document.getElementById("my_input")
      equal editorElement.value, "<div>Hello world</div>"
      done()
