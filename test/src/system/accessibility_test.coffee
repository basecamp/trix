{assert, test, testGroup, triggerEvent} = Trix.TestHelpers

testGroup "Accessibility attributes", template: "editor_default_aria_label", ->
  test "sets the role to textbox", (done) ->
    editor = document.getElementById("editor-without-labels")

    assert.equal editor.getAttribute("role"), "textbox"
    done()

  test "does not set aria-label when the element has no <label> elements", (done) ->
    editor = document.getElementById("editor-without-labels")

    assert.equal editor.hasAttribute("aria-label"), false
    done()

  test "does not override aria-label when the element declares it", (done) ->
    editor = document.getElementById("editor-with-aria-label")

    assert.equal editor.getAttribute("aria-label"), "ARIA Label text"
    done()

  test "does not set aria-label when the element declares aria-labelledby", (done) ->
    editor = document.getElementById("editor-with-aria-labelledby")

    assert.equal editor.hasAttribute("aria-label"), false
    assert.equal editor.getAttribute("aria-labelledby"),"aria-labelledby-id"
    done()

  test "assigns aria-label to the text of the element's <label> elements", (done) ->
    editor = document.getElementById("editor-with-labels")

    assert.equal editor.getAttribute("aria-label"), "Label 1 Label 2 Label 3"
    done()

  test "updates the aria-label on focus", (done) ->
    editor = document.getElementById("editor-with-modified-label")
    label = document.getElementById("modified-label")

    assert.equal editor.getAttribute("aria-label"), "Original Value"

    label.innerHTML = "<span>New Value</span>"
    triggerEvent(editor, "focus")

    assert.equal editor.getAttribute("aria-label"), "New Value"
    done()
