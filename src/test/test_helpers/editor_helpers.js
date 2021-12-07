import { TEST_IMAGE_URL } from "test/test_helpers/fixtures/test_image_url"

import Attachment from "trix/models/attachment"

export insertString = (string) ->
  getComposition().insertString(string)
  render()

export insertText = (text) ->
  getComposition().insertText(text)
  render()

export insertDocument = (document) ->
  getComposition().insertDocument(document)
  render()

export insertFile = (file) ->
  getComposition().insertFile(file)
  render()

export insertAttachment = (attachment) ->
  getComposition().insertAttachment(attachment)
  render()

export insertAttachments = (attachments) ->
  getComposition().insertAttachments(attachments)
  render()

export insertImageAttachment = (attributes) ->
  attachment = createImageAttachment(attributes)
  insertAttachment(attachment)

export createImageAttachment = (attributes) ->
  attributes ?=
    url: TEST_IMAGE_URL
    width: 10
    height: 10
    filename: "image.gif"
    filesize: 35
    contentType: "image/gif"

  new Attachment attributes

export replaceDocument = (document) ->
  getComposition().setDocument(document)
  render()

render = ->
  getEditorController().render()
