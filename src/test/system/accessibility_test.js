import * as config from "trix/config"
import { assert, test, testGroup, testIf, testUnless, triggerEvent } from "test/test_helper"

testGroup("Accessibility attributes", { template: "editor_default_aria_label" }, () => {
  test("sets the role to textbox", () => {
    const editor = document.getElementById("editor-without-labels")
    assert.equal(editor.getAttribute("role"), "textbox")
  })

  test("does not set aria-label when the element has no <label> elements", () => {
    const editor = document.getElementById("editor-without-labels")
    assert.equal(editor.hasAttribute("aria-label"), false)
  })

  test("does not override aria-label when the element declares it", () => {
    const editor = document.getElementById("editor-with-aria-label")
    assert.equal(editor.getAttribute("aria-label"), "ARIA Label text")
  })

  test("does not set aria-label when the element declares aria-labelledby", () => {
    const editor = document.getElementById("editor-with-aria-labelledby")
    assert.equal(editor.hasAttribute("aria-label"), false)
    assert.equal(editor.getAttribute("aria-labelledby"), "aria-labelledby-id")
  })

  testUnless(config.editor.formAssociated, "assigns aria-label to the text of the element's <label> elements", () => {
    const editor = document.getElementById("editor-with-labels")
    assert.equal(editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3")
  })

  testUnless(config.editor.formAssociated, "updates the aria-label on focus", () => {
    const editor = document.getElementById("editor-with-modified-label")
    const label = document.getElementById("modified-label")

    label.innerHTML = "<span>New Value</span>"
    triggerEvent(editor, "focus")
    assert.equal(editor.getAttribute("aria-label"), "New Value")
  })

  testIf(config.editor.formAssociated, "does not set [aria-label] for a <label> element", () => {
    const editor = document.getElementById("editor-with-labels")
    const labels = Array.from(editor.labels)
    const text = labels.map((label) => label.textContent.trim())

    assert.deepEqual(text, [ "Label 1", "Label 2", "Label 3" ])
    assert.equal(editor.getAttribute("aria-label"), null)
  })
})
