/* eslint-disable
    no-undef,
    no-unused-vars,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { assert, clickToolbarButton, createImageAttachment, defer, insertAttachments, moveCursor, pressKey, test, testGroup, typeCharacters } from "test/test_helper"
import { OBJECT_REPLACEMENT_CHARACTER } from "trix/constants"

const ORC = OBJECT_REPLACEMENT_CHARACTER

testGroup("Attachment galleries", { template: "editor_empty" }, function() {
  test("inserting more than one image attachment creates a gallery block", function(expectDocument) {
    insertAttachments(createImageAttachments(2))
    assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
    return expectDocument(`${ORC}${ORC}\n`)
  })

  test("gallery formatting is removed from blocks containing less than two image attachments", function(expectDocument) {
    insertAttachments(createImageAttachments(2))
    assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
    getEditor().setSelectedRange([ 1, 2 ])
    return pressKey("backspace", () => requestAnimationFrame(function() {
      assert.blockAttributes([ 0, 2 ], [])
      return expectDocument(`${ORC}\n`)
    }))
  })

  test("typing in an attachment gallery block splits it", function(expectDocument) {
    insertAttachments(createImageAttachments(4))
    getEditor().setSelectedRange(2)
    return typeCharacters("a", () => requestAnimationFrame(function() {
      assert.blockAttributes([ 0, 2 ], [ "attachmentGallery" ])
      assert.blockAttributes([ 3, 4 ], [])
      assert.blockAttributes([ 5, 7 ], [ "attachmentGallery" ])
      return expectDocument(`${ORC}${ORC}\na\n${ORC}${ORC}\n`)
    }))
  })

  return test("inserting a gallery in a formatted block", expectDocument => clickToolbarButton({ attribute: "quote" }, () => typeCharacters("abc", function() {
    insertAttachments(createImageAttachments(2))
    return requestAnimationFrame(function() {
      assert.blockAttributes([ 0, 3 ], [ "quote" ])
      assert.blockAttributes([ 4, 6 ], [ "attachmentGallery" ])
      return expectDocument(`abc\n${ORC}${ORC}\n`)
    })
  })))
})

var createImageAttachments = function(num) {
  if (num == null) { num = 1 }
  const attachments = []
  while (attachments.length < num) {
    attachments.push(createImageAttachment())
  }
  return attachments
}
