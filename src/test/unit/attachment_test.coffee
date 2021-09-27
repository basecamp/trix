import Trix from "trix/global"
import Attachment from "trix/models/attachment"

import { assert, test, testGroup } from "test/test_helper"

testGroup "Attachment", ->
  previewableTypes = "image image/gif image/png image/jpg".split(" ")
  nonPreviewableTypes = "image/tiff application/foo".split(" ")

  createAttachment = (attributes) ->
    new Attachment attributes

  for contentType in previewableTypes then do (contentType) ->
    test "#{contentType} content type is previewable", ->
      assert.ok createAttachment({contentType}).isPreviewable()

  for contentType in nonPreviewableTypes then do (contentType) ->
    test "#{contentType} content type is NOT previewable", ->
      assert.notOk createAttachment({contentType}).isPreviewable()

  test "'previewable' attribute determines previewability", ->
    attrs = previewable: true, contentType: nonPreviewableTypes[0]
    assert.ok createAttachment(attrs).isPreviewable()

    attrs = previewable: false, contentType: previewableTypes[0]
    assert.notOk createAttachment(attrs).isPreviewable()
