import { assert, skipIf, test, testGroup, triggerEvent } from "test/test_helper"
import TrixEditorElement from "trix/elements/trix_editor_element"

testGroup("Accessibility attributes", { template: "editor_default_aria_label" }, () => {
  test("sets the role to textbox", () => {
    const editor = document.getElementById("editor-without-labels")
    assert.equal(editor.getAttribute("role"), "textbox")
  })

  skipIf(TrixEditorElement.formAssociated, "does not set aria-label when the element has no <label> elements", () => {
    const editor = document.getElementById("editor-without-labels")
    assert.equal(editor.hasAttribute("aria-label"), false)
  })

  skipIf(TrixEditorElement.formAssociated, "does not override aria-label when the element declares it", () => {
    const editor = document.getElementById("editor-with-aria-label")
    assert.equal(editor.getAttribute("aria-label"), "ARIA Label text")
  })

  skipIf(TrixEditorElement.formAssociated, "does not set aria-label when the element declares aria-labelledby", () => {
    const editor = document.getElementById("editor-with-aria-labelledby")
    assert.equal(editor.hasAttribute("aria-label"), false)
    assert.equal(editor.getAttribute("aria-labelledby"), "aria-labelledby-id")
  })

  skipIf(TrixEditorElement.formAssociated, "assigns aria-label to the text of the element's <label> elements", () => {
    const editor = document.getElementById("editor-with-labels")
    assert.equal(editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3")
  })

  skipIf(TrixEditorElement.formAssociated, "updates the aria-label on focus", () => {
    const editor = document.getElementById("editor-with-modified-label")
    const label = document.getElementById("modified-label")

    label.innerHTML = "<span>New Value</span>"
    triggerEvent(editor, "focus")
    assert.equal(editor.getAttribute("aria-label"), "New Value")
  })
})
