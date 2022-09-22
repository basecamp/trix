import {
  assert,
  clickToolbarButton,
  createImageAttachment,
  expectDocument,
  insertAttachments,
  pressKey,
  test,
  testGroup,
  typeCharacters,
} from "test/test_helper"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"
import { nextFrame } from "../test_helpers/timing_helpers"

const ORC = OBJECT_REPLACEMENT_CHARACTER

testGroup("Attachment galleries", { template: "editor_empty" }, () => {
  test("inserting more than one image attachment creates a gallery block", () => {
    insertAttachments(createImageAttachments(2))
    assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
    expectDocument(`${ORC}${ORC}\n`)
  })

  test("gallery formatting is removed from blocks containing less than two image attachments", async () => {
    insertAttachments(createImageAttachments(2))
    assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
    getEditor().setSelectedRange([ 1, 2 ])

    await pressKey("backspace")
    await nextFrame()

    assert.blockAttributes([ 0, 2 ], [])
    expectDocument(`${ORC}\n`)
  })

  test("typing in an attachment gallery block splits it", async () => {
    insertAttachments(createImageAttachments(4))
    getEditor().setSelectedRange(2)

    await typeCharacters("a")
    await nextFrame()

    assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
    assert.blockAttributes([ 3, 4 ], [])
    assert.blockAttributes([ 5, 7 ], [ "attachmentGallery" ])
    expectDocument(`${ORC}${ORC}\na\n${ORC}${ORC}\n`)
  })

  test("inserting a gallery in a formatted block", async () => {
    await clickToolbarButton({ attribute: "quote" })
    await typeCharacters("abc")

    insertAttachments(createImageAttachments(2))
    await nextFrame()

    assert.blockAttributes([ 0, 3 ], [ "quote" ])
    assert.blockAttributes([ 4, 6 ], [ "attachmentGallery" ])
    expectDocument(`abc\n${ORC}${ORC}\n`)
  })
})

const createImageAttachments = function (num) {
  if (num == null) {
    num = 1
  }
  const attachments = []
  while (attachments.length < num) {
    attachments.push(createImageAttachment())
  }
  return attachments
}
