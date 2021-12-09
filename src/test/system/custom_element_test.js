import { rangesAreEqual } from "trix/core/helpers"

import {
  TEST_IMAGE_URL,
  after,
  assert,
  clickElement,
  clickToolbarButton,
  createFile,
  defer,
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

testGroup("Custom element API", { template: "editor_empty" }, () => {
  test("element triggers trix-initialize on first connect", (done) => {
    const container = document.getElementById("trix-container")
    container.innerHTML = ""

    let initializeEventCount = 0
    const element = document.createElement("trix-editor")
    element.addEventListener("trix-initialize", () => initializeEventCount++)

    container.appendChild(element)
    requestAnimationFrame(() => {
      container.removeChild(element)
      requestAnimationFrame(() => {
        container.appendChild(element)
        after(60, () => {
          assert.equal(initializeEventCount, 1)
          done()
        })
      })
    })
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

  test("element triggers trix-change events when the document changes", (done) => {
    const element = getEditorElement()
    let eventCount = 0
    element.addEventListener("trix-change", (event) => eventCount++)

    typeCharacters("a", () => {
      assert.equal(eventCount, 1)
      moveCursor("left", () => {
        assert.equal(eventCount, 1)
        typeCharacters("bcd", () => {
          assert.equal(eventCount, 4)
          clickToolbarButton({ action: "undo" }, () => {
            assert.equal(eventCount, 5)
            done()
          })
        })
      })
    })
  })

  test("element triggers trix-change event after toggling attributes", (done) => {
    const element = getEditorElement()
    const { editor } = element

    const afterChangeEvent = function (edit, callback) {
      let handler
      element.addEventListener(
        "trix-change",
        handler = function (event) {
          element.removeEventListener("trix-change", handler)
          callback(event)
        }
      )
      edit()
    }

    typeCharacters("hello", () => {
      let edit = () => editor.activateAttribute("quote")
      afterChangeEvent(edit, () => {
        assert.ok(editor.attributeIsActive("quote"))

        edit = () => editor.deactivateAttribute("quote")
        afterChangeEvent(edit, () => {
          assert.notOk(editor.attributeIsActive("quote"))

          editor.setSelectedRange([ 0, 5 ])
          edit = () => editor.activateAttribute("bold")
          afterChangeEvent(edit, () => {
            assert.ok(editor.attributeIsActive("bold"))

            edit = () => editor.deactivateAttribute("bold")
            afterChangeEvent(edit, () => {
              assert.notOk(editor.attributeIsActive("bold"))
              done()
            })
          })
        })
      })
    })
  })

  test("disabled attributes aren't considered active", (done) => {
    const { editor } = getEditorElement()
    editor.activateAttribute("heading1")
    assert.notOk(editor.attributeIsActive("code"))
    assert.notOk(editor.attributeIsActive("quote"))
    done()
  })

  test("element triggers trix-selection-change events when the location range changes", (done) => {
    const element = getEditorElement()
    let eventCount = 0
    element.addEventListener("trix-selection-change", (event) => eventCount++)

    typeCharacters("a", () => {
      assert.equal(eventCount, 1)
      moveCursor("left", () => {
        assert.equal(eventCount, 2)
        done()
      })
    })
  })

  test("only triggers trix-selection-change events on the active element", (done) => {
    const elementA = getEditorElement()
    const elementB = document.createElement("trix-editor")
    elementA.parentNode.insertBefore(elementB, elementA.nextSibling)

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
      done()
    })
  })

  test("element triggers toolbar dialog events", (done) => {
    const element = getEditorElement()
    const events = []

    element.addEventListener("trix-toolbar-dialog-show", (event) => events.push(event.type))

    element.addEventListener("trix-toolbar-dialog-hide", (event) => events.push(event.type))

    clickToolbarButton({ action: "link" }, () =>
      typeInToolbarDialog("http://example.com", { attribute: "href" }, () =>
        defer(() => {
          assert.deepEqual(events, [ "trix-toolbar-dialog-show", "trix-toolbar-dialog-hide" ])
          done()
        })
      )
    )
  })

  test("element triggers before-paste event with paste data", (expectDocument) => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-before-paste", function (event) {
      eventCount++
      paste = event.paste
    })

    typeCharacters("", () =>
      pasteContent("text/html", "<strong>hello</strong>", () => {
        assert.equal(eventCount, 1)
        assert.equal(paste.type, "text/html")
        assert.equal(paste.html, "<strong>hello</strong>")
        expectDocument("hello\n")
      })
    )
  })

  test("element triggers before-paste event with mutable paste data", (expectDocument) => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-before-paste", function (event) {
      eventCount++
      paste = event.paste
      paste.html = "<strong>greetings</strong>"
    })

    typeCharacters("", () =>
      pasteContent("text/html", "<strong>hello</strong>", () => {
        assert.equal(eventCount, 1)
        assert.equal(paste.type, "text/html")
        expectDocument("greetings\n")
      })
    )
  })

  test("element triggers paste event with position range", (done) => {
    const element = getEditorElement()
    let eventCount = 0
    let paste = null

    element.addEventListener("trix-paste", function (event) {
      eventCount++
      paste = event.paste
    })

    typeCharacters("", () =>
      pasteContent("text/html", "<strong>hello</strong>", () => {
        assert.equal(eventCount, 1)
        assert.equal(paste.type, "text/html")
        assert.ok(rangesAreEqual([ 0, 5 ], paste.range))
        done()
      })
    )
  })

  test("element triggers attribute change events", (done) => {
    const element = getEditorElement()
    let eventCount = 0
    let attributes = null

    element.addEventListener("trix-attributes-change", function (event) {
      eventCount++
      attributes = event.attributes
    })

    typeCharacters("", () => {
      assert.equal(eventCount, 0)
      clickToolbarButton({ attribute: "bold" }, () => {
        assert.equal(eventCount, 1)
        assert.deepEqual({ bold: true }, attributes)
        done()
      })
    })
  })

  test("element triggers action change events", (done) => {
    const element = getEditorElement()
    let eventCount = 0
    let actions = null

    element.addEventListener("trix-actions-change", function (event) {
      eventCount++
      actions = event.actions
    })

    typeCharacters("", () => {
      assert.equal(eventCount, 0)
      clickToolbarButton({ attribute: "bullet" }, () => {
        assert.equal(eventCount, 1)
        assert.equal(actions.decreaseNestingLevel, true)
        assert.equal(actions.increaseNestingLevel, false)
        done()
      })
    })
  })

  test("element triggers custom focus and blur events", (done) => {
    const element = getEditorElement()

    let focusEventCount = 0
    let blurEventCount = 0
    element.addEventListener("trix-focus", () => focusEventCount++)
    element.addEventListener("trix-blur", () => blurEventCount++)

    triggerEvent(element, "blur")
    defer(() => {
      assert.equal(blurEventCount, 1)
      assert.equal(focusEventCount, 0)

      triggerEvent(element, "focus")
      defer(() => {
        assert.equal(blurEventCount, 1)
        assert.equal(focusEventCount, 1)

        insertImageAttachment()
        after(20, () =>
          clickElement(element.querySelector("figure"), () => {
            const textarea = element.querySelector("textarea")
            textarea.focus()
            defer(() => {
              assert.equal(document.activeElement, textarea)
              assert.equal(blurEventCount, 1)
              assert.equal(focusEventCount, 1)
              done()
            })
          })
        )
      })
    })
  })

  // Selenium doesn't seem to focus windows properly in some browsers (FF 47 on OS X)
  // so skip this test when unfocused pending a better solution.
  testIf(document.hasFocus(), "element triggers custom focus event when autofocusing", (done) => {
    const element = document.createElement("trix-editor")
    element.setAttribute("autofocus", "")

    let focusEventCount = 0
    element.addEventListener("trix-focus", () => focusEventCount++)

    const container = document.getElementById("trix-container")
    container.innerHTML = ""
    container.appendChild(element)

    element.addEventListener("trix-initialize", () => {
      assert.equal(focusEventCount, 1)
      done()
    })
  })

  test("element serializes HTML after attribute changes", (done) => {
    const element = getEditorElement()
    let serializedHTML = element.value

    typeCharacters("a", () => {
      assert.notEqual(serializedHTML, element.value)
      serializedHTML = element.value

      clickToolbarButton({ attribute: "quote" }, () => {
        assert.notEqual(serializedHTML, element.value)
        serializedHTML = element.value

        clickToolbarButton({ attribute: "quote" }, () => {
          assert.notEqual(serializedHTML, element.value)
          done()
        })
      })
    })
  })

  test("element serializes HTML after attachment attribute changes", (done) => {
    const element = getEditorElement()
    const attributes = { url: "test_helpers/fixtures/logo.png", contentType: "image/png" }

    element.addEventListener("trix-attachment-add", function (event) {
      const { attachment } = event
      requestAnimationFrame(() => {
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
        requestAnimationFrame(() => done())
      })
    })

    requestAnimationFrame(() => insertImageAttachment())
  })

  test("editor resets to its original value on form reset", (expectDocument) => {
    const element = getEditorElement()
    const { form } = element.inputElement

    typeCharacters("hello", () => {
      form.reset()
      expectDocument("\n")
    })
  })

  test("editor resets to last-set value on form reset", (expectDocument) => {
    const element = getEditorElement()
    const { form } = element.inputElement

    element.value = "hi"
    typeCharacters("hello", () => {
      form.reset()
      expectDocument("hi\n")
    })
  })

  test("editor respects preventDefault on form reset", (expectDocument) => {
    const element = getEditorElement()
    const { form } = element.inputElement
    const preventDefault = (event) => event.preventDefault()

    typeCharacters("hello", () => {
      form.addEventListener("reset", preventDefault, false)
      form.reset()
      form.removeEventListener("reset", preventDefault, false)
      expectDocument("hello\n")
    })
  })
})

testGroup("<label> support", { template: "editor_with_labels" }, () => {
  test("associates all label elements", (done) => {
    const labels = [ document.getElementById("label-1"), document.getElementById("label-3") ]
    assert.deepEqual(getEditorElement().labels, labels)
    done()
  })

  test("focuses when <label> clicked", (done) => {
    document.getElementById("label-1").click()
    assert.equal(getEditorElement(), document.activeElement)
    done()
  })

  test("focuses when <label> descendant clicked", (done) => {
    document.getElementById("label-1").querySelector("span").click()
    assert.equal(getEditorElement(), document.activeElement)
    done()
  })

  test("does not focus when <label> controls another element", (done) => {
    const label = document.getElementById("label-2")
    assert.notEqual(getEditorElement(), label.control)
    label.click()
    assert.notEqual(getEditorElement(), document.activeElement)
    done()
  })
})

testGroup("form property references its <form>", { template: "editors_with_forms", container: "div" }, () => {
  test("accesses its ancestor form", (done) => {
    const form = document.getElementById("ancestor-form")
    const editor = document.getElementById("editor-with-ancestor-form")
    assert.equal(editor.form, form)
    done()
  })

  test("transitively accesses its related <input> element's <form>", (done) => {
    const form = document.getElementById("input-form")
    const editor = document.getElementById("editor-with-input-form")
    assert.equal(editor.form, form)
    done()
  })

  test("returns null when there is no associated <form>", (done) => {
    const editor = document.getElementById("editor-with-no-form")
    assert.equal(editor.form, null)
    done()
  })
})
