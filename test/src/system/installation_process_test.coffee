trix.testGroup "Installation process", template: "editor_html", ->
  trix.test "element.editorController", ->
    trix.assert.ok getEditorController() instanceof Trix.EditorController

  trix.test "creates a contenteditable element", ->
    trix.assert.ok getEditorElement()

  trix.test "loads the initial document", ->
    trix.assert.equal getEditorElement().textContent, "Hello world"

  trix.test "sets value property", (done) ->
    trix.defer ->
      trix.assert.equal getEditorElement().value, "<div>Hello world</div>"
      done()


trix.testGroup "Installation process without specified elements", template: "editor_empty", ->
  trix.test "creates identified toolbar and input elements", (done) ->
    editorElement = getEditorElement()

    toolbarId = editorElement.getAttribute("toolbar")
    trix.assert.ok /trix-toolbar-\d+/.test(toolbarId), "toolbar id not trix.assert.ok #{JSON.stringify(toolbarId)}"
    toolbarElement = document.getElementById(toolbarId)
    trix.assert.ok toolbarElement, "toolbar element not trix.assert.ok"
    trix.assert.equal editorElement.toolbarElement, toolbarElement

    inputId = editorElement.getAttribute("input")
    trix.assert.ok /trix-input-\d+/.test(inputId), "input id not trix.assert.ok #{JSON.stringify(inputId)}"
    inputElement = document.getElementById(inputId)
    trix.assert.ok inputElement, "input element not trix.assert.ok"
    trix.assert.equal editorElement.inputElement, inputElement

    done()


trix.testGroup "Installation process with specified elements", template: "editor_with_toolbar_and_input", ->
  trix.test "uses specified elements", (done) ->
    editorElement = getEditorElement()
    trix.assert.equal editorElement.toolbarElement, document.getElementById("my_toolbar")
    trix.assert.equal editorElement.inputElement, document.getElementById("my_input")
    trix.assert.equal editorElement.value, "<div>Hello world</div>"
    done()

  trix.test "can be cloned", (done) ->
    originalElement = document.getElementById("my_editor")
    clonedElement = originalElement.cloneNode(true)

    {parentElement} = originalElement
    parentElement.removeChild(originalElement)
    parentElement.appendChild(clonedElement)

    trix.defer ->
      editorElement = getEditorElement()
      trix.assert.equal editorElement.toolbarElement, document.getElementById("my_toolbar")
      trix.assert.equal editorElement.inputElement, document.getElementById("my_input")
      trix.assert.equal editorElement.value, "<div>Hello world</div>"
      done()
