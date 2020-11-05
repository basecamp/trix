{assert, test, testGroup, triggerEvent} = Trix.TestHelpers

testGroup "Accessibility attributes", template: "editor_default_aria_label", ->
  test "sets the role to textbox", ->
    editor = document.getElementById("editor-without-labels")
    assert.equal editor.getAttribute("role"), "textbox"

  test "does not set aria-label when the element has no <label> elements", ->
    editor = document.getElementById("editor-without-labels")
    assert.equal editor.hasAttribute("aria-label"), false

  test "does not override aria-label when the element declares it", ->
    editor = document.getElementById("editor-with-aria-label")
    assert.equal editor.getAttribute("aria-label"), "ARIA Label text"

  test "does not set aria-label when the element declares aria-labelledby", ->
    editor = document.getElementById("editor-with-aria-labelledby")
    assert.equal editor.hasAttribute("aria-label"), false
    assert.equal editor.getAttribute("aria-labelledby"),"aria-labelledby-id"

  test "assigns aria-label to the text of the element's <label> elements", ->
    editor = document.getElementById("editor-with-labels")
    assert.equal editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3"

  test "updates the aria-label on focus", ->
    editor = document.getElementById("editor-with-modified-label")
    label = document.getElementById("modified-label")

    label.innerHTML = "<span>New Value</span>"
    triggerEvent(editor, "focus")
    assert.equal editor.getAttribute("aria-label"), "New Value"
