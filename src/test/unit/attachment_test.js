import { assert, test, testGroup } from "test/test_helper"
import Attachment from "trix/models/attachment"

testGroup("Attachment", () => {
  const previewableTypes = "image image/gif image/png image/jpg image/webp".split(" ")
  const nonPreviewableTypes = "image/tiff application/foo".split(" ")

  const createAttachment = (attributes) => new Attachment(attributes)

  previewableTypes.forEach((contentType) => {
    test(`${contentType} content type is previewable`, () => {
      assert.ok(createAttachment({ contentType }).isPreviewable())
    })
  })

  nonPreviewableTypes.forEach((contentType) => {
    test(`${contentType} content type is NOT previewable`, () => {
      assert.notOk(createAttachment({ contentType }).isPreviewable())
    })
  })

  test("'previewable' attribute determines previewability", () => {
    let attrs = { previewable: true, contentType: nonPreviewableTypes[0] }
    assert.ok(createAttachment(attrs).isPreviewable())

    attrs = { previewable: false, contentType: previewableTypes[0] }
    assert.notOk(createAttachment(attrs).isPreviewable())
  })
})
