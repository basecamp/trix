import { rangesAreEqual } from "trix/core/helpers"

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
    assert.deepEqual(getEditorElement().labels, labels)
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
})
