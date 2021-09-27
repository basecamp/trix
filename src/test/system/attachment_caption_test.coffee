import Trix from "trix/global"
import config from "trix/config"

{assert, insertImageAttachment, test, testGroup} = Trix.TestHelpers

testGroup "Attachment captions", template: "editor_empty", ->
  test "default caption includes file name and size", ->
    insertImageAttachment()
    element = getCaptionElement()
    assert.notOk element.hasAttribute("data-trix-placeholder")
    assert.equal element.textContent, "image.gif 35 Bytes"

  test "caption excludes file name when configured", ->
    withPreviewCaptionConfig name: false, size: true, ->
      insertImageAttachment()
      element = getCaptionElement()
      assert.notOk element.hasAttribute("data-trix-placeholder")
      assert.equal element.textContent, "35 Bytes"

  test "caption excludes file size when configured", ->
    withPreviewCaptionConfig name: true, size: false, ->
      insertImageAttachment()
      element = getCaptionElement()
      assert.notOk element.hasAttribute("data-trix-placeholder")
      assert.equal element.textContent, "image.gif"

  test "caption is empty when configured", ->
    withPreviewCaptionConfig name: false, size: false, ->
      insertImageAttachment()
      element = getCaptionElement()
      assert.ok element.hasAttribute("data-trix-placeholder")
      assert.equal element.getAttribute("data-trix-placeholder"), config.lang.captionPlaceholder
      assert.equal element.textContent, ""

withPreviewCaptionConfig = (captionConfig = {}, fn) ->
  {caption} = config.attachments.preview
  config.attachments.preview.caption = captionConfig
  try
    fn()
  finally
    config.attachments.preview.caption = caption

getCaptionElement = ->
  getEditorElement().querySelector("figcaption")
