// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, test, testGroup, triggerEvent } from "test/test_helper"

testGroup("Accessibility attributes", { template: "editor_default_aria_label" }, function() {
  test("sets the role to textbox", function() {
    const editor = document.getElementById("editor-without-labels")
    return assert.equal(editor.getAttribute("role"), "textbox")
  })

  test("does not set aria-label when the element has no <label> elements", function() {
    const editor = document.getElementById("editor-without-labels")
    return assert.equal(editor.hasAttribute("aria-label"), false)
  })

  test("does not override aria-label when the element declares it", function() {
    const editor = document.getElementById("editor-with-aria-label")
    return assert.equal(editor.getAttribute("aria-label"), "ARIA Label text")
  })

  test("does not set aria-label when the element declares aria-labelledby", function() {
    const editor = document.getElementById("editor-with-aria-labelledby")
    assert.equal(editor.hasAttribute("aria-label"), false)
    return assert.equal(editor.getAttribute("aria-labelledby"), "aria-labelledby-id")
  })

  test("assigns aria-label to the text of the element's <label> elements", function() {
    const editor = document.getElementById("editor-with-labels")
    return assert.equal(editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3")
  })

  return test("updates the aria-label on focus", function() {
    const editor = document.getElementById("editor-with-modified-label")
    const label = document.getElementById("modified-label")

    label.innerHTML = "<span>New Value</span>"
    triggerEvent(editor, "focus")
    return assert.equal(editor.getAttribute("aria-label"), "New Value")
  })
})
