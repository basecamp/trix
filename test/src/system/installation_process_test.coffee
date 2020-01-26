{assert, defer, test, testGroup} = Trix.TestHelpers

testGroup "Installation process", template: "editor_html", ->
  test "element.editorController", ->
    assert.ok getEditorController() instanceof Trix.EditorController

  test "creates a contenteditable element", ->
    assert.ok getEditorElement()

  test "loads the initial document", ->
    assert.equal getEditorElement().textContent, "Hello world"

  test "sets value property", (done) ->
    defer ->
      assert.equal getEditorElement().htmlValue, "<div>Hello world</div>"
      done()


testGroup "Installation process without specified elements", template: "editor_empty", ->
  test "creates identified toolbar and input elements", (done) ->
    editorElement = getEditorElement()

    toolbarId = editorElement.getAttribute("toolbar")
    assert.ok /trix-toolbar-\d+/.test(toolbarId), "toolbar id not assert.ok #{JSON.stringify(toolbarId)}"
    toolbarElement = document.getElementById(toolbarId)
    assert.ok toolbarElement, "toolbar element not assert.ok"
    assert.equal editorElement.toolbarElement, toolbarElement

    htmlInputId = editorElement.getAttribute("html-input")
    assert.ok /trix-html-input-\d+/.test(htmlInputId), "input id not assert.ok #{JSON.stringify(htmlInputId)}"
    htmlInputElement = document.getElementById(htmlInputId)
    assert.ok htmlInputElement, "input element not assert.ok"
    assert.equal editorElement.htmlInputElement, htmlInputElement

    mdInputId = editorElement.getAttribute("md-input")
    assert.ok /trix-md-input-\d+/.test(mdInputId), "input id not assert.ok #{JSON.stringify(mdInputId)}"
    mdInputElement = document.getElementById(mdInputId)
    assert.ok mdInputElement, "input element not assert.ok"
    assert.equal editorElement.mdInputElement, mdInputElement

    done()

testGroup "Installation process with specified elements", template: "editor_with_toolbar_and_input", ->
  test "uses specified elements", (done) ->
    editorElement = getEditorElement()
    assert.equal editorElement.toolbarElement, document.getElementById("my_toolbar")
    assert.equal editorElement.htmlInputElement, document.getElementById("my_input")
    assert.equal editorElement.htmlValue, "<div>Hello world</div>"
    done()

  test "can be cloned", (done) ->
    originalElement = document.getElementById("my_editor")
    clonedElement = originalElement.cloneNode(true)

    {parentElement} = originalElement
    parentElement.removeChild(originalElement)
    parentElement.appendChild(clonedElement)

    defer ->
      editorElement = getEditorElement()
      assert.equal editorElement.toolbarElement, document.getElementById("my_toolbar")
      assert.equal editorElement.htmlInputElement, document.getElementById("my_input")
      assert.equal editorElement.htmlValue, "<div>Hello world</div>"
      done()

testGroup "Installation process with specified md input", template: "editor_with_md_input", ->
  test "uses specified elements", (done) ->
    editorElement = getEditorElement()
    assert.equal editorElement.htmlInputElement, document.getElementById(editorElement.getAttribute("html-input"))
    assert.equal editorElement.htmlInputElement.value, "<div><strong>Hello World</strong></div>"
    done()
