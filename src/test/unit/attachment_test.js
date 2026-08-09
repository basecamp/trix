import { assert, test, testGroup } from "test/test_helper"
import Attachment from "trix/models/attachment"
import HTMLParser from "trix/models/html_parser"

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

  // Regression: basecamp/trix#1213. Re-inflating stored HTML under SAFE_FOR_XML
  // must keep an attachment whose serialized content carries HTML comments.
  test("parses an attachment with comment-bearing content under SAFE_FOR_XML", () => {
    const content = "<!-- BEGIN app/views/users/_user.html.erb --><span>Chris</span><!-- END app/views/users/_user.html.erb -->"
    const attributes = { contentType: "application/octet-stream", content, sgid: "abc123" }
    const html = `<div><figure data-trix-attachment='${JSON.stringify(attributes)}'></figure></div>`

    const document = HTMLParser.parse(html, { purifyOptions: { SAFE_FOR_XML: true } }).getDocument()
    const attachments = document.getAttachments()

    assert.equal(attachments.length, 1, "attachment was dropped during re-inflation")
    assert.equal(attachments[0].getContent(), content, "attachment content comments were altered")
  })
})
