import { assert, clickToolbarButton, expandSelection, isToolbarButtonActive, isToolbarButtonDisabled, test, testGroup, typeCharacters } from "test/test_helper"
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

  test("the recreated toolbar is connected to the editor", async () => {
    const element = getEditorElement()

    element.toolbarElement.remove()
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.toolbarElement.querySelector("[data-trix-input][name='href']").disabled)

    await typeCharacters("abc")
    await expandSelection("left")
    await clickToolbarButton({ attribute: "bold" })
    assert.textAttributes([ 2, 3 ], { bold: true })
  })

  test("removing only the 'connected' attribute will recreate toolbar", async () => {
    const element = getEditorElement()

    const originalToolbar = element.toolbarElement
    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(element.toolbarElement)
    assert.notEqual(originalToolbar, element.toolbarElement)
    assert.ok(element.toolbarElement.querySelector("[data-trix-input][name='href']").disabled)

    await typeCharacters("abc")
    await expandSelection("left")
    await clickToolbarButton({ attribute: "bold" })
    assert.textAttributes([ 2, 3 ], { bold: true })
  })

  test("reconnecting restores formatting and undo/redo button states", async () => {
    const element = getEditorElement()
    await typeCharacters("abc")
    await expandSelection("left")
    await clickToolbarButton({ attribute: "bold" })

    element.removeAttribute("connected")
    await nextFrame()

    assert.ok(isToolbarButtonActive({ attribute: "bold" }))
    assert.notOk(isToolbarButtonDisabled({ action: "undo" }))
    assert.ok(isToolbarButtonDisabled({ action: "redo" }))

    await clickToolbarButton({ action: "undo" })
    await clickToolbarButton({ action: "undo" })
    element.removeAttribute("connected")
    await nextFrame()

    assert.notOk(isToolbarButtonActive({ attribute: "bold" }))
    assert.ok(isToolbarButtonDisabled({ action: "undo" }))
    assert.notOk(isToolbarButtonDisabled({ action: "redo" }))

    await clickToolbarButton({ action: "redo" })
    await clickToolbarButton({ action: "redo" })
    assert.textAttributes([ 2, 3 ], { bold: true })
  })

  for (const removeDialog of [ false, true ]) {
    test(`reconnecting thaws an open link dialog with removed markup: ${removeDialog}`, async () => {
      const element = getEditorElement()
      await typeCharacters("abc")
      await expandSelection("left")
      await clickToolbarButton({ attribute: "href" })
      assert.ok(element.editorController.selectionFrozen)

      if (removeDialog) element.toolbarElement.replaceChildren()
      element.removeAttribute("connected")
      await nextFrame()

      assert.notOk(element.editorController.selectionFrozen)
      assert.equal(element.editorController.selectionManager.lockCount, 0)
      assert.ok(element.toolbarElement.querySelector("[data-trix-input][name='href']").disabled)

      element.focus()
      element.editor.setSelectedRange([ 0, 1 ])
      await nextFrame()
      await clickToolbarButton({ attribute: "bold" })
      assert.textAttributes([ 0, 1 ], { bold: true })
      assert.textAttributes([ 2, 3 ], {})
    })
  }
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
