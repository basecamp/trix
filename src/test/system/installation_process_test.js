import EditorController from "trix/controllers/editor_controller"

import { assert, setFixtureHTML, test, testGroup } from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

testGroup("Installation process", { template: "editor_html" }, () => {
  test("element.editorController", () => {
    assert.ok(getEditorController() instanceof EditorController)
  })

  test("creates a contenteditable element", () => assert.ok(getEditorElement()))

  test("loads the initial document", () => {
    assert.equal(getEditorElement().textContent, "Hello world")
  })

  test("sets value property", async () => {
    await nextFrame()
    assert.equal(getEditorElement().value, "<div>Hello world</div>")
  })
})

testGroup("Installation process without specified elements", { template: "editor_empty" }, () =>
  test("creates identified toolbar and input elements", () => {
    const editorElement = getEditorElement()

    const toolbarId = editorElement.getAttribute("toolbar")
    assert.ok(/trix-toolbar-\d+/.test(toolbarId), `toolbar id not assert.ok ${JSON.stringify(toolbarId)}`)
    const toolbarElement = document.getElementById(toolbarId)
    assert.ok(toolbarElement, "toolbar element not assert.ok")
    assert.equal(editorElement.toolbarElement, toolbarElement)

    const inputId = editorElement.getAttribute("input")
    assert.ok(/trix-input-\d+/.test(inputId), `input id not assert.ok ${JSON.stringify(inputId)}`)
    const inputElement = document.getElementById(inputId)
    assert.ok(inputElement, "input element not assert.ok")
    assert.equal(editorElement.inputElement, inputElement)
  })
)

testGroup("Installation process with specified elements", { template: "editor_with_toolbar_and_input" }, () => {
  test("uses specified elements", () => {
    const editorElement = getEditorElement()
    assert.equal(editorElement.toolbarElement, document.getElementById("my_toolbar"))
    assert.equal(editorElement.inputElement, document.getElementById("my_input"))
    assert.equal(editorElement.value, "<div>Hello world</div>")
  })

  test("can be cloned", async () => {
    const originalElement = document.getElementById("my_editor")
    const clonedElement = originalElement.cloneNode(true)

    const { parentElement } = originalElement
    parentElement.removeChild(originalElement)
    parentElement.appendChild(clonedElement)

    await nextFrame()

    const editorElement = getEditorElement()
    assert.equal(editorElement.toolbarElement, document.getElementById("my_toolbar"))
    assert.equal(editorElement.inputElement, document.getElementById("my_input"))
    assert.equal(editorElement.value, "<div>Hello world</div>")
  })
})

testGroup("Installation process with content and without specified elements", () => {
  test("loads the trix-editor element's innerHTML on boot", async () => {
    await setFixtureHTML("<trix-editor><div>Hello world</div></trix-editor>")

    const editorElement = getEditorElement()

    assert.equal(1, editorElement.childElementCount, "sanitzes HTML")
    assert.equal(editorElement.value, "<div>Hello world</div>")
    assert.equal(editorElement.value, editorElement.inputElement.value)
  })

  test("sanitizes the trix-editor element's innerHTML on boot", async () => {
    await setFixtureHTML("<trix-editor><script>alert('xss')</script></trix-editor>")

    const editorElement = getEditorElement()

    assert.equal(0, editorElement.querySelectorAll("script").length, "sanitzes HTML")
    assert.equal(editorElement.value, "")
    assert.equal(editorElement.value, editorElement.inputElement.value)
  })
})

testGroup("Installation process with content and input", () => {
  test("prioritzes loading its initial state from the input over the content", async () => {
    await setFixtureHTML(`
      <trix-editor input="input"><div>from editor</div></trix-editor>
      <textarea id="input"><div>from input</div></textarea>
    `)

    const editorElement = getEditorElement()

    assert.equal(editorElement.value, "<div>from input</div>")
  })
})
