import { makeElement, rangesAreEqual } from "trix/core/helpers"
import TrixEditorElement from "trix/elements/trix_editor_element"

import {
  TEST_IMAGE_URL,
  assert,
  clickElement,
  clickToolbarButton,
  createFile,
  expectDocument,
  insertImageAttachment,
  moveCursor,
  pasteContent,
  setFixtureHTML,
  test,
  testGroup,
  testIf,
  triggerEvent,
  typeCharacters,
  typeInToolbarDialog,
} from "test/test_helper"
import { delay, nextFrame } from "../test_helpers/timing_helpers"

testGroup("Custom element API", { template: "editor_empty" }, () => {
  test("element triggers trix-initialize on first connect", async () => {
    const container = document.getElementById("trix-container")
    container.innerHTML = ""

    let initializeEventCount = 0
    const element = document.createElement("trix-editor")
    element.addEventListener("trix-initialize", () => initializeEventCount++)

    container.appendChild(element)
    await nextFrame()

    container.removeChild(element)
    await nextFrame()

    container.appendChild(element)
    await delay(60)

    assert.equal(initializeEventCount, 1)
  })

  test("files are accepted by default", () => {
    getComposition().insertFile(createFile())
    assert.equal(getComposition().getAttachments().length, 1)
  })

  test("rejecting a file by canceling the trix-file-accept event", () => {
    getEditorElement().addEventListener("trix-file-accept", (event) => event.preventDefault())
    getComposition().insertFile(createFile())
    assert.equal(getComposition().getAttachments().length, 0)
  })

  test("element triggers attachment events", () => {
    const file = createFile()
    const element = getEditorElement()
    const composition = getComposition()
    let attachment = null
    const events = []

    element.addEventListener("trix-file-accept", function (event) {
      events.push(event.type)
      assert.ok(file === event.file)
    })

    element.addEventListener("trix-attachment-add", function (event) {
      events.push(event.type)
      attachment = event.attachment
    })

    composition.insertFile(file)
    assert.deepEqual(events, [ "trix-file-accept", "trix-attachment-add" ])

    element.addEventListener("trix-attachment-remove", function (event) {
      events.push(event.type)
      assert.ok(attachment === event.attachment)
    })

    attachment.remove()
    assert.deepEqual(events, [ "trix-file-accept", "trix-attachment-add", "trix-attachment-remove" ])
  })

  test("element triggers trix-change when an attachment is edited", () => {
    const file = createFile()
    const element = getEditorElement()
    const composition = getComposition()
    let attachment = null
    const events = []

    element.addEventListener("trix-attachment-add", (event) => attachment = event.attachment)

    composition.insertFile(file)

    element.addEventListener("trix-attachment-edit", (event) => events.push(event.type))

    element.addEventListener("trix-change", (event) => events.push(event.type))

    attachment.setAttributes({ width: 9876 })
    assert.deepEqual(events, [ "trix-attachment-edit", "trix-change" ])
  })

  test("editing the document in a trix-attachment-add handler doesn't trigger trix-attachment-add again", () => {
    const element = getEditorElement()
    const composition = getComposition()
    let eventCount = 0

    element.addEventListener("trix-attachment-add", () => {
      if (eventCount++ === 0) {
        element.editor.setSelectedRange([ 0, 1 ])
        element.editor.activateAttribute("bold")
      }
    })

    composition.insertFile(createFile())
    assert.equal(eventCount, 1)
  })

  test("element triggers trix-change events when the document changes", async () => {
    const element = getEditorElement()
    let eventCount = 0
    element.addEventListener("trix-change", (event) => eventCount++)

    await typeCharacters("a")
    assert.equal(eventCount, 1)

    await moveCursor("left")
    assert.equal(eventCount, 1)

    await typeCharacters("bcd")
    assert.equal(eventCount, 4)

    await clickToolbarButton({ action: "undo" })
    assert.equal(eventCount, 5)
  })

  test("invoking internal actions does not dispatch a trix-action-invoke event", async () => {
    let event = null

    addEventListener("trix-action-invoke", (ev) => event = ev, { once: true })
    await clickToolbarButton({ action: "link" })

    assert.equal(null, event)
  })

  test("invoking external actions dispatches a trix-action-invoke event", async () => {
    let event = null
    const editor = getEditorElement()
    editor.toolbarElement.insertAdjacentHTML("beforeend", `
      <button id="test-action" type="button" data-trix-action="x-test"></button>
    `)

    addEventListener("trix-action-invoke", (ev) => event = ev, { once: true })
    await clickToolbarButton({ action: "x-test" })

    assert.equal(editor, event.target)
    assert.equal("x-test", event.actionName)
    assert.equal(document.getElementById("test-action"), event.invokingElement)
  })

  test("element triggers trix-change event after toggling attributes", async () => {
    const element = getEditorElement()
    const { editor } = element

    const afterChangeEvent = (edit) => {
      return new Promise((resolve) => {
        let handler
        element.addEventListener(
          "trix-change",
          handler = function (event) {
            element.removeEventListener("trix-change", handler)
            resolve(event)
          }
        )
        edit()
      })
    }

    await typeCharacters("hello")

    let edit = () => editor.activateAttribute("quote")
    await afterChangeEvent(edit)
    assert.ok(editor.attributeIsActive("quote"))

    edit = () => editor.deactivateAttribute("quote")
    await afterChangeEvent(edit)
    assert.notOk(editor.attributeIsActive("quote"))

    editor.setSelectedRange([ 0, 5 ])

    edit = () => editor.activateAttribute("bold")
    await afterChangeEvent(edit)
    assert.ok(editor.attributeIsActive("bold"))

    edit = () => editor.deactivateAttribute("bold")
    await afterChangeEvent(edit)
    assert.notOk(editor.attributeIsActive("bold"))
  })

  test("disabled attributes aren't considered active", async () => {
    const { editor } = getEditorElement()
    editor.activateAttribute("heading1")
    assert.notOk(editor.attributeIsActive("code"))
    assert.notOk(editor.attributeIsActive("quote"))
  })

  test("element triggers trix-selection-change events when the location range changes", async () => {
    const element = getEditorElement()
    let eventCount = 0

    element.addEventListener("trix-selection-change", (event) => eventCount++)
    await nextFrame()

    await typeCharacters("a")
    assert.equal(eventCount, 1)

    await moveCursor("left")
    assert.equal(eventCount, 2)
  })

  test("only triggers trix-selection-change events on the active element", () => {
    const elementA = getEditorElement()
    const elementB = document.createElement("trix-editor")
    elementA.parentNode.insertBefore(elementB, elementA.nextSibling)

    return new Promise((resolve) => {
      elementB.addEventListener("trix-initialize", () => {
        elementA.editor.insertString("a")
        elementB.editor.insertString("b")
        rangy.getSelection().removeAllRanges()

        let eventCountA = 0
        let eventCountB = 0
        elementA.addEventListener("trix-selection-change", (event) => eventCountA++)
        elementB.addEventListener("trix-selection-change", (event) => eventCountB++)

        elementA.editor.setSelectedRange(0)
        assert.equal(eventCountA, 1)
        assert.equal(eventCountB, 0)

        elementB.editor.setSelectedRange(0)
        assert.equal(eventCountA, 1)
        assert.equal(eventCountB, 1)

        elementA.editor.setSelectedRange(1)
        assert.equal(eventCountA, 2)
        assert.equal(eventCountB, 1)
        resolve()
      })
    })
  })

  test("element triggers toolbar dialog events", async () => {
    const element = getEditorElement()
    const events = []

    element.addEventListener("trix-toolbar-dialog-show", (event) => events.push(event.type))
    element.addEventListener("trix-toolbar-dialog-hide", (event) => events.push(event.type))
    await nextFrame()

    await clickToolbarButton({ action: "link" })
    await typeInToolbarDialog("http://example.com", { attribute: "href" })
    await nextFrame()

    assert.deepEqual(events, [ "trix-toolbar-dialog-show", "trix-toolbar-dialog-hide" ])
  })

  test("element triggers before-paste event with paste data", async () => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-before-paste", function (event) {
      eventCount++
      paste = event.paste
    })

    await typeCharacters("")
    await pasteContent("text/html", "<strong>hello</strong>")

    assert.equal(eventCount, 1)
    assert.equal(paste.type, "text/html")
    assert.equal(paste.html, "<strong>hello</strong>")

    expectDocument("hello\n")
  })

  test("element triggers before-paste event with mutable paste data", async () => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-before-paste", function (event) {
      eventCount++
      paste = event.paste
      paste.html = "<strong>greetings</strong>"
    })

    await typeCharacters("")
    await pasteContent("text/html", "<strong>hello</strong>")

    assert.equal(eventCount, 1)
    assert.equal(paste.type, "text/html")
    expectDocument("greetings\n")
  })

  test("element triggers paste event with position range", async () => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-paste", function (event) {
      eventCount++
      paste = event.paste
    })

    await typeCharacters("")
    await pasteContent("text/html", "<strong>hello</strong>")

    assert.equal(eventCount, 1)
    assert.equal(paste.type, "text/html")
    assert.ok(rangesAreEqual([ 0, 5 ], paste.range))
  })

  test("element triggers attribute change events", async () => {
    const element = getEditorElement()
    let eventCount = 0
    let attributes = null

    element.addEventListener("trix-attributes-change", function (event) {
      eventCount++
      attributes = event.attributes
    })

    await typeCharacters("")
    assert.equal(eventCount, 0)

    await clickToolbarButton({ attribute: "bold" })

    assert.equal(eventCount, 1)
    assert.deepEqual({ bold: true }, attributes)
  })

  test("element triggers action change events", async () => {
    const element = getEditorElement()
    let eventCount = 0
    let actions = null

    element.addEventListener("trix-actions-change", function (event) {
      eventCount++
      actions = event.actions
    })

    await typeCharacters("")
    assert.equal(eventCount, 0)

    await clickToolbarButton({ attribute: "bullet" })

    assert.equal(eventCount, 1)
    assert.equal(actions.decreaseNestingLevel, true)
    assert.equal(actions.increaseNestingLevel, false)
  })

  test("element triggers custom focus and blur events", async () => {
    const element = getEditorElement()

    let focusEventCount = 0
    let blurEventCount = 0
    element.addEventListener("trix-focus", () => focusEventCount++)
    element.addEventListener("trix-blur", () => blurEventCount++)

    triggerEvent(element, "blur")
    await delay(10)

    assert.equal(blurEventCount, 1)
    assert.equal(focusEventCount, 0)

    triggerEvent(element, "focus")
    await delay(10)

    assert.equal(blurEventCount, 1)
    assert.equal(focusEventCount, 1)

    insertImageAttachment()
    await delay(20)

    await clickElement(element.querySelector("figure"))

    const textarea = element.querySelector("textarea")
    textarea.focus()
    await nextFrame()

    assert.equal(document.activeElement, textarea)
    assert.equal(blurEventCount, 1)
    assert.equal(focusEventCount, 1)
  })

  // Selenium doesn't seem to focus windows properly in some browsers (FF 47 on OS X)
  // so skip this test when unfocused pending a better solution.
  testIf(document.hasFocus(), "element triggers custom focus event when autofocusing", () => {
    const element = document.createElement("trix-editor")
    element.setAttribute("autofocus", "")

    let focusEventCount = 0
    element.addEventListener("trix-focus", () => focusEventCount++)

    const container = document.getElementById("trix-container")
    container.innerHTML = ""
    container.appendChild(element)

    return new Promise((resolve) => {
      element.addEventListener("trix-initialize", () => {
        assert.equal(focusEventCount, 1)
        resolve()
      })
    })
  })

  test("element serializes HTML after attribute changes", async () => {
    const element = getEditorElement()
    let serializedHTML = element.value

    await typeCharacters("a")
    assert.notEqual(serializedHTML, element.value)
    serializedHTML = element.value

    await clickToolbarButton({ attribute: "quote" })
    assert.notEqual(serializedHTML, element.value)
    serializedHTML = element.value

    await clickToolbarButton({ attribute: "quote" })
    assert.notEqual(serializedHTML, element.value)
  })

  test("element serializes HTML after attachment attribute changes", async () => {
    const element = getEditorElement()
    const attributes = { url: "test_helpers/fixtures/logo.png", contentType: "image/png" }

    const promise = new Promise((resolve) => {
      element.addEventListener("trix-attachment-add", async (event) => {
        const { attachment } = event
        await nextFrame()

        let serializedHTML = element.value
        attachment.setAttributes(attributes)
        assert.notEqual(serializedHTML, element.value)

        serializedHTML = element.value
        assert.ok(serializedHTML.indexOf(TEST_IMAGE_URL) < 0, "serialized HTML contains previous attachment attributes")
        assert.ok(
          serializedHTML.indexOf(attributes.url) > 0,
          "serialized HTML doesn't contain current attachment attributes"
        )

        attachment.remove()
        await nextFrame()
        resolve()
      })
    })


    await nextFrame()
    insertImageAttachment()

    return promise
  })

  test("editor resets to its original value on form reset", async () => {
    const element = getEditorElement()
    const { form } = element.inputElement

    await typeCharacters("hello")
    form.reset()
    expectDocument("\n")
  })

  test("editor resets to last-set value on form reset", async () => {
    const element = getEditorElement()
    const { form } = element.inputElement

    element.value = "hi"
    await typeCharacters("hello")
    form.reset()
    expectDocument("hi\n")
  })

  test("editor respects preventDefault on form reset", async () => {
    const element = getEditorElement()
    const { form } = element.inputElement
    const preventDefault = (event) => event.preventDefault()

    await typeCharacters("hello")

    form.addEventListener("reset", preventDefault, false)
    form.reset()
    form.removeEventListener("reset", preventDefault, false)
    expectDocument("hello\n")
  })
})

testGroup("<label> support", { template: "editor_with_labels" }, () => {
  test("associates all label elements", () => {
    const labels = [ document.getElementById("label-1"), document.getElementById("label-3") ]
    assert.deepEqual(Array.from(getEditorElement().labels), labels)
  })

  test("focuses when <label> clicked", () => {
    document.getElementById("label-1").click()
    assert.equal(getEditorElement(), document.activeElement)
  })

  test("focuses when <label> descendant clicked", () => {
    document.getElementById("label-1").querySelector("span").click()
    assert.equal(getEditorElement(), document.activeElement)
  })

  test("does not focus when <label> controls another element", () => {
    const label = document.getElementById("label-2")
    assert.notEqual(getEditorElement(), label.control)
    label.click()
    assert.notEqual(getEditorElement(), document.activeElement)
  })
})

testGroup("form property references its <form>", { template: "editors_with_forms", container: "div" }, () => {
  test("accesses its ancestor form", () => {
    const form = document.getElementById("ancestor-form")
    const editor = document.getElementById("editor-with-ancestor-form")
    assert.equal(editor.form, form)
  })

  test("transitively accesses its related <input> element's <form>", () => {
    const form = document.getElementById("input-form")
    const editor = document.getElementById("editor-with-input-form")
    assert.equal(editor.form, form)
  })

  test("returns null when there is no associated <form>", () => {
    const editor = document.getElementById("editor-with-no-form")
    assert.equal(editor.form, null)
  })

  test("editor resets to its original value on element reset", async () => {
    const element = getEditorElement()

    await typeCharacters("hello")
    element.reset()
    expectDocument("\n")
  })

  test("element returns empty string when value is missing", () => {
    const element = getEditorElement()

    assert.equal(element.value, "")
  })

  test("editor returns its type", () => {
    const element = getEditorElement()

    assert.equal("trix-editor", element.type)
  })

  testIf(TrixEditorElement.formAssociated, "adds [disabled] attribute based on .disabled property", () => {
    const editor = document.getElementById("editor-with-ancestor-form")

    editor.disabled = true

    assert.equal(editor.hasAttribute("disabled"), true, "adds [disabled] attribute")

    editor.disabled = false

    assert.equal(editor.hasAttribute("disabled"), false, "removes [disabled] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "removes [contenteditable] and disables input when editor element has [disabled]", () => {
    const editor = document.getElementById("editor-with-no-form")

    editor.setAttribute("disabled", "")

    assert.equal(editor.matches(":disabled"), true, "sets :disabled CSS pseudostate")
    assert.equal(editor.inputElement.disabled, true, "disables input")
    assert.equal(editor.disabled, true, "exposes [disabled] attribute as .disabled property")
    assert.equal(editor.hasAttribute("contenteditable"), false, "removes [contenteditable] attribute")

    editor.removeAttribute("disabled")

    assert.equal(editor.matches(":disabled"), false, "removes sets :disabled pseudostate")
    assert.equal(editor.inputElement.disabled, false, "enabled input")
    assert.equal(editor.disabled, false, "updates .disabled property")
    assert.equal(editor.hasAttribute("contenteditable"), true, "adds [contenteditable] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "removes [contenteditable] and disables input when editor element is :disabled", () => {
    const editor = document.getElementById("editor-within-fieldset")
    const fieldset = document.getElementById("fieldset")

    fieldset.disabled = true

    assert.equal(editor.matches(":disabled"), true, "sets :disabled CSS pseudostate")
    assert.equal(editor.inputElement.disabled, true, "disables input")
    assert.equal(editor.disabled, true, "infers disabled state from ancestor")
    assert.equal(editor.hasAttribute("disabled"), false, "does not set [disabled] attribute")
    assert.equal(editor.hasAttribute("contenteditable"), false, "removes [contenteditable] attribute")

    fieldset.disabled = false

    assert.equal(editor.matches(":disabled"), false, "removes sets :disabled pseudostate")
    assert.equal(editor.inputElement.disabled, false, "enabled input")
    assert.equal(editor.disabled, false, "updates .disabled property")
    assert.equal(editor.hasAttribute("disabled"), false, "does not set [disabled] attribute")
    assert.equal(editor.hasAttribute("contenteditable"), true, "adds [contenteditable] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "does not receive focus when :disabled", () => {
    const activeEditor = document.getElementById("editor-with-input-form")
    const editor = document.getElementById("editor-within-fieldset")

    activeEditor.focus()
    editor.disabled = true
    editor.focus()

    assert.equal(activeEditor, document.activeElement, "disabled editor does not receive focus")
  })

  testIf(TrixEditorElement.formAssociated, "disabled editor does not encode its value when the form is submitted", () => {
    const editor = document.getElementById("editor-with-ancestor-form")
    const form = editor.form

    editor.inputElement.value = "Hello world"
    editor.disabled = true

    assert.deepEqual({}, Object.fromEntries(new FormData(form).entries()), "does not write to FormData")
  })

  testIf(TrixEditorElement.formAssociated, "validates with [required] attribute as invalid", () => {
    const editor = document.getElementById("editor-with-ancestor-form")
    const form = editor.form
    const invalidInput = makeElement("input", { required: true })
    let invalidEvent, submitEvent = null

    editor.addEventListener("invalid", event => invalidEvent = event, { once: true })
    form.addEventListener("submit", event => submitEvent = event, { once: true })

    editor.required = true
    form.requestSubmit()

    // assert.equal(document.activeElement, editor, "editor receives focus")
    assert.equal(editor.required, true, ".required property retrurns true")
    assert.equal(editor.validity.valid, false, "validity.valid is false")
    assert.equal(editor.validationMessage, invalidInput.validationMessage, "sets .validationMessage")
    assert.equal(invalidEvent.target, editor, "dispatches 'invalid' event on editor")
    assert.equal(submitEvent, null, "does not dispatch a 'submit' event")
  })

  testIf(TrixEditorElement.formAssociated, "does not validate with [disabled] attribute", () => {
    const editor = document.getElementById("editor-with-ancestor-form")
    let invalidEvent = null

    editor.disabled = true
    editor.required = true
    editor.addEventListener("invalid", event => invalidEvent = event, { once: true })
    editor.reportValidity()

    assert.equal(invalidEvent, null, "does not dispatch an 'invalid' event")
  })

  testIf(TrixEditorElement.formAssociated, "re-validates when the value changes", async () => {
    const editor = document.getElementById("editor-with-ancestor-form")
    editor.required = true
    editor.focus()

    assert.equal(editor.validity.valid, false, "validity.valid is initially false")

    await typeCharacters("a")

    assert.equal(editor.validity.valid, true, "validity.valid is true after re-validating")
    assert.equal(editor.validity.valueMissing, false, "validity.valueMissing is false")
    assert.equal(editor.validationMessage, "", "clears the validationMessage")
  })

  testIf(TrixEditorElement.formAssociated, "accepts a customError validation message", () => {
    const editor = document.getElementById("editor-with-ancestor-form")

    editor.setCustomValidity("A custom validation message")

    assert.equal(editor.validity.valid, false)
    assert.equal(editor.validity.customError, true)
    assert.equal(editor.validationMessage, "A custom validation message")
  })
})

const configureInputAssociated = ({ target }) => target.willCreateInput = false

testGroup("TrixEditorElement.willCreateInput = false", {
  setup: () => addEventListener("trix-before-initialize", configureInputAssociated),
  teardown: () => removeEventListener("trix-before-initialize", configureInputAssociated)
}, () => {
  testIf(TrixEditorElement.formAssociated, "does not create an <input> on connect", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const container = document.getElementById("trix-container")
    const editor = getEditorElement()

    assert.equal(container.querySelectorAll("input[type=hidden]").length, 0)
    assert.equal(editor.hasAttribute("input"), false)
    assert.equal(editor.inputElement, null)
  })

  testIf(TrixEditorElement.formAssociated, "associates an <input> element when [input] attribute is set", async () => {
    await setFixtureHTML(`
      <trix-editor input="input"></trix-editor>
      <input id="input">
    `)

    const editor = getEditorElement()
    const inputElement = document.getElementById("input")

    assert.equal(editor.getAttribute("input"), inputElement.id)
    assert.strictEqual(editor.inputElement, inputElement)
  })

  testIf(TrixEditorElement.formAssociated, "accesses its ancestor form", async () => {
    await setFixtureHTML("<form><trix-editor></trix-editor></form>", "div")

    const form = document.querySelector("form")
    const editor = getEditorElement()

    assert.equal(editor.form, form)
  })

  testIf(TrixEditorElement.formAssociated, "accesses its related <form> through the [form] attribute", async () => {
    await setFixtureHTML(`
      <form id="form"></form>
      <trix-editor form="form"></trix-editor>
    `, "div")

    const form = document.getElementById("form")
    const editor = getEditorElement()

    assert.equal(editor.form, form)
  })

  testIf(TrixEditorElement.formAssociated, "returns null when there is no associated <form>", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>", "div")

    const editor = getEditorElement()

    assert.equal(editor.form, null)
  })

  testIf(TrixEditorElement.formAssociated, "reads and writes [name] attribute through .name property", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const editor = getEditorElement()

    assert.equal(editor.name, null)
    assert.equal(editor.hasAttribute("name"), false, "has no [name] when .name is null")

    editor.name = "content"

    assert.equal(editor.name, "content")
    assert.equal(editor.getAttribute("name"), "content")
  })

  testIf(TrixEditorElement.formAssociated, "makes its sanitized value available to its <form>", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const editor = getEditorElement()
    const empty = new FormData(editor.form)

    assert.deepEqual(Array.from(empty.values()), [], "does not serialize to FormData without [name]")

    editor.name = "content"
    editor.value = "<div>hello</div><script>alert('hacked!')</script>"

    const formData = new FormData(editor.form)

    assert.deepEqual(formData.get("content"), "<div>hello</div>", "serializes sanitized value to FormData")
  })

  testIf(TrixEditorElement.formAssociated, "editor resets to its original value on element reset", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const element = getEditorElement()

    element.editor.loadHTML("<div>hello</div")
    element.reset()

    assert.equal(element.value, "")
  })

  testIf(TrixEditorElement.formAssociated, "element returns empty string when value is missing", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const element = getEditorElement()

    assert.equal(element.value, "")
  })

  testIf(TrixEditorElement.formAssociated, "adds [disabled] attribute based on .disabled property", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const editor = getEditorElement()

    editor.disabled = true

    assert.equal(editor.hasAttribute("disabled"), true, "adds [disabled] attribute")

    editor.disabled = false

    assert.equal(editor.hasAttribute("disabled"), false, "removes [disabled] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "removes [contenteditable] and when editor element has [disabled]", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>")

    const editor = getEditorElement()

    editor.setAttribute("disabled", "")

    assert.equal(editor.matches(":disabled"), true, "sets :disabled CSS pseudostate")
    assert.equal(editor.disabled, true, "exposes [disabled] attribute as .disabled property")
    assert.equal(editor.hasAttribute("contenteditable"), false, "removes [contenteditable] attribute")

    editor.removeAttribute("disabled")

    assert.equal(editor.matches(":disabled"), false, "removes sets :disabled pseudostate")
    assert.equal(editor.disabled, false, "updates .disabled property")
    assert.equal(editor.hasAttribute("contenteditable"), true, "adds [contenteditable] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "removes [contenteditable] when editor element is :disabled", async () => {
    await setFixtureHTML("<trix-editor></trix-editor>", "fieldset")

    const editor = getEditorElement()
    const fieldset = editor.closest("fieldset")

    fieldset.disabled = true

    assert.equal(editor.matches(":disabled"), true, "sets :disabled CSS pseudostate")
    assert.equal(editor.disabled, true, "infers disabled state from ancestor")
    assert.equal(editor.hasAttribute("disabled"), false, "does not set [disabled] attribute")
    assert.equal(editor.hasAttribute("contenteditable"), false, "removes [contenteditable] attribute")

    fieldset.disabled = false

    assert.equal(editor.matches(":disabled"), false, "removes sets :disabled pseudostate")
    assert.equal(editor.disabled, false, "updates .disabled property")
    assert.equal(editor.hasAttribute("disabled"), false, "does not set [disabled] attribute")
    assert.equal(editor.hasAttribute("contenteditable"), true, "adds [contenteditable] attribute")
  })

  testIf(TrixEditorElement.formAssociated, "does not receive focus when :disabled", async () => {
    await setFixtureHTML(`
      <trix-editor id="active"></trix-editor>
      <trix-editor id="disabled" disabled></trix-editor>
    `)

    const activeEditor = document.getElementById("active")
    const disabledEditor = document.getElementById("disabled")

    activeEditor.focus()

    assert.equal(activeEditor, document.activeElement)

    disabledEditor.focus()

    assert.equal(activeEditor, document.activeElement, "disabled editor does not receive focus")
  })

  testIf(TrixEditorElement.formAssociated, "disabled editor does not encode its value when the form is submitted", async () => {
    await setFixtureHTML(`
      <trix-editor name="ignored" disabled></trix-editor>
    `)

    const editor = getEditorElement()

    editor.value = "Hello world"

    assert.deepEqual(Array.from(new FormData(editor.form).values()), [], "does not write to FormData")
  })
})
