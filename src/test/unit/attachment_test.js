/* eslint-disable
    func-style,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Attachment from "trix/models/attachment"

import { assert, test, testGroup } from "test/test_helper"

testGroup("Attachment", function() {
  let contentType
  const previewableTypes = "image image/gif image/png image/jpg".split(" ")
  const nonPreviewableTypes = "image/tiff application/foo".split(" ")

  const createAttachment = attributes => new Attachment(attributes)

  for (contentType of previewableTypes) { (contentType => test(`${contentType} content type is previewable`, () => assert.ok(createAttachment({ contentType }).isPreviewable())))(contentType) }

  for (contentType of nonPreviewableTypes) { (contentType => test(`${contentType} content type is NOT previewable`, () => assert.notOk(createAttachment({ contentType }).isPreviewable())))(contentType) }

  return test("'previewable' attribute determines previewability", function() {
    let attrs = { previewable: true, contentType: nonPreviewableTypes[0] }
    assert.ok(createAttachment(attrs).isPreviewable())

    attrs = { previewable: false, contentType: previewableTypes[0] }
    return assert.notOk(createAttachment(attrs).isPreviewable())
  })
})
