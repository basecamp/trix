import * as config from "trix/config"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

import {
  assert,
  clickElement,
  clickToolbarButton,
  createFile,
  dragToCoordinates,
  expectDocument,
  moveCursor,
  pressKey,
  test,
  testGroup,
  triggerEvent,
  typeCharacters,
} from "test/test_helper"
import { delay, nextFrame } from "../test_helpers/timing_helpers"

testGroup("Attachments", { template: "editor_with_image" }, () => {
  test("moving an image by drag and drop", async () => {
    await typeCharacters("!")

    const coordinates = await moveCursor({ direction: "right", times: 1 })
    const img = document.activeElement.querySelector("img")
    triggerEvent(img, "mousedown")

    await nextFrame()
    await dragToCoordinates(coordinates)

    expectDocument(`!a${OBJECT_REPLACEMENT_CHARACTER}b\n`)
  })

  test("removing an image", async () => {
    await delay(20)
    await clickElement(getFigure())

    const closeButton = getFigure().querySelector("[data-trix-action=remove]")
    await clickElement(closeButton)

    expectDocument("ab\n")
  })

  test("intercepting attachment toolbar creation", async () => {
    function insertToolbarButton(event) {
      const { toolbar, attachment } = event

      assert.ok(toolbar.matches(".attachment__toolbar"))
      assert.equal(attachment.getContentType(), "image")

      toolbar.querySelector(".trix-button-group").insertAdjacentHTML("beforeend", "<button class=\"new-button\">👍</button>")
    }

    getEditorElement().addEventListener("trix-attachment-before-toolbar", insertToolbarButton, { once: true })

    await clickElement(getFigure())

    assert.ok(getEditorElement().querySelector(".trix-button-group .new-button"))
  })

  test("editing an image caption", async () => {
    await delay(20)

    await clickElement(findElement("figure"))
    await clickElement(findElement("figcaption"))

    await nextFrame()

    const textarea = findElement("textarea")
    assert.ok(textarea)

    textarea.focus()
    textarea.value = "my"
    triggerEvent(textarea, "input")

    await nextFrame()
    textarea.value = ""

    await nextFrame()
    textarea.value = "my caption"
    triggerEvent(textarea, "input")

    await pressKey("return")
    assert.notOk(findElement("textarea"))
    assert.textAttributes([ 2, 3 ], { caption: "my caption" })
    assert.locationRange({ index: 0, offset: 3 })
    expectDocument(`ab${OBJECT_REPLACEMENT_CHARACTER}\n`)
  })

  test("editing an attachment caption with no filename", async () => {
    await delay(20)

    let captionElement = findElement("figcaption")
    assert.ok(captionElement.clientHeight > 0)
    assert.equal(captionElement.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder)

    await clickElement(findElement("figure"))

    captionElement = findElement("figcaption")
    assert.ok(captionElement.clientHeight > 0)
    assert.equal(captionElement.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder)
  })

  test("updating an attachment's href attribute while editing its caption", async () => {
    const attachment = getEditorController().attachmentManager.getAttachments()[0]

    await delay(20)

    await clickElement(findElement("figure"))
    await clickElement(findElement("figcaption"))

    await nextFrame()

    let textarea = findElement("textarea")
    assert.ok(textarea)
    textarea.focus()
    textarea.value = "my caption"
    triggerEvent(textarea, "input")
    attachment.setAttributes({ href: "https://example.com" })

    await nextFrame()

    textarea = findElement("textarea")
    assert.ok(document.activeElement === textarea)
    assert.equal(textarea.value, "my caption")

    await pressKey("return")

    assert.notOk(findElement("textarea"))
    assert.textAttributes([ 2, 3 ], { caption: "my caption" })
    assert.locationRange({ index: 0, offset: 3 })

    expectDocument(`ab${OBJECT_REPLACEMENT_CHARACTER}\n`)
  })

  testGroup("File insertion", { template: "editor_empty" }, () => {
    test("inserting a file in a formatted block", async () => {
      await clickToolbarButton({ attribute: "bullet" })
      await clickToolbarButton({ attribute: "bold" })

      getComposition().insertFile(createFile())

      assert.blockAttributes([ 0, 1 ], [ "bulletList", "bullet" ])
      assert.textAttributes([ 0, 1 ], {})
      expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}\n`)
    })

    test("inserting a files in a formatted block", async () => {
      await clickToolbarButton({ attribute: "quote" })
      await clickToolbarButton({ attribute: "italic" })

      getComposition().insertFiles([ createFile(), createFile() ])

      assert.blockAttributes([ 0, 2 ], [ "quote" ])
      assert.textAttributes([ 0, 1 ], {})
      assert.textAttributes([ 1, 2 ], {})
      expectDocument(`${OBJECT_REPLACEMENT_CHARACTER}${OBJECT_REPLACEMENT_CHARACTER}\n`)
    })
  })
})

const getFigure = () => findElement("figure")

const findElement = (selector) => getEditorElement().querySelector(selector)
