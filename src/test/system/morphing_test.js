import { assert, test, testGroup } from "test/test_helper"
import { nextFrame } from "../test_helpers/timing_helpers"

import { Idiomorph } from "idiomorph"

function renderWithMorph(event) {
  event.render = (editorElement, documentFragment) => {
    Idiomorph.morph(editorElement, documentFragment, { morphStyle: "innerHTML" })
  }
}

testGroup("morphing editor content", {
  template: "editor_empty",
  beforeSetup: () => addEventListener("trix-before-render", renderWithMorph),
  afterTeardown: () => removeEventListener("trix-before-render", renderWithMorph)
}, () => {
  test("renders changed elements with morphing", () => {
    const element = getEditorElement()

    element.editor.loadHTML("<div>hello</div>")

    const before = element.firstElementChild
    assert.equal(before.textContent, "hello")

    element.editor.loadHTML("<div>goodbye</div>")

    const after = element.firstElementChild
    assert.equal(after.textContent, "goodbye")
    assert.strictEqual(after, before, "preserves element across renders")
  })

  test("renders with morphing when ancestor elements are morphed", () => {
    const element = getEditorElement()

    Idiomorph.morph(
      element.parentElement,
      "<trix-editor><div>hello</div></trix-editor>",
      { morphStyle: "innerHTML" }
    )

    const before = element.firstElementChild
    assert.equal(before.textContent, "hello")

    Idiomorph.morph(
      element.parentElement,
      "<trix-editor><div>goodbye</div></trix-editor>",
      { morphStyle: "innerHTML" }
    )

    const after = element.firstElementChild
    assert.equal(after.textContent, "goodbye")
    assert.strictEqual(after, before, "preserves element across renders")
  })
})

testGroup("morphing with internal toolbar", { template: "editor_empty" }, () => {
  test("removing the 'connected' attribute will reset the editor and recreate toolbar", async () => {
    const element = getEditorElement()

    assert.ok(element.hasAttribute("connected"))

    const originalToolbar = element.toolbarElement
    element.toolbarElement.remove()
    element.removeAttribute("toolbar")
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.hasAttribute("connected"))
    assert.ok(element.toolbarElement)
    assert.notEqual(originalToolbar, element.toolbarElement)
  })
})

testGroup("morphing with external toolbar", { template: "editor_with_toolbar_and_input" }, () => {
  test("removing the 'connected' attribute will reset the editor leave the toolbar untouched", async () => {
    const element = getEditorElement()

    assert.ok(element.hasAttribute("connected"))

    const originalToolbar = element.toolbarElement
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.hasAttribute("connected"))
    assert.ok(element.toolbarElement)
    assert.equal(originalToolbar, element.toolbarElement)
  })
})
