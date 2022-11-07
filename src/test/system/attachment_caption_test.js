import * as config from "trix/config"
import { assert, insertImageAttachment, test, testGroup } from "test/test_helper"

testGroup("Attachment captions", { template: "editor_empty" }, () => {
  test("default caption includes file name and size", () => {
    insertImageAttachment()
    const element = getCaptionElement()
    assert.notOk(element.hasAttribute("data-trix-placeholder"))
    assert.equal(element.textContent, "image.gif 35 Bytes")
  })

  test("caption excludes file name when configured", () => {
    withPreviewCaptionConfig({ name: false, size: true }, () => {
      insertImageAttachment()
      const element = getCaptionElement()
      assert.notOk(element.hasAttribute("data-trix-placeholder"))
      assert.equal(element.textContent, "35 Bytes")
    })
  })

  test("caption excludes file size when configured", () => {
    withPreviewCaptionConfig({ name: true, size: false }, () => {
      insertImageAttachment()
      const element = getCaptionElement()
      assert.notOk(element.hasAttribute("data-trix-placeholder"))
      assert.equal(element.textContent, "image.gif")
    })
  })

  test("caption is empty when configured", () => {
    withPreviewCaptionConfig({ name: false, size: false }, () => {
      insertImageAttachment()
      const element = getCaptionElement()
      assert.ok(element.hasAttribute("data-trix-placeholder"))
      assert.equal(element.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder)
      assert.equal(element.textContent, "")
    })
  })
})

const withPreviewCaptionConfig = (captionConfig, fn) => {
  if (!captionConfig) captionConfig = {}
  const { caption } = config.attachments.preview
  config.attachments.preview.caption = captionConfig
  try {
    return fn()
  } finally {
    config.attachments.preview.caption = caption
  }
}

const getCaptionElement = () => getEditorElement().querySelector("figcaption")
