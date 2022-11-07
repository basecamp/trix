import { TEST_IMAGE_URL } from "test/test_helpers/fixtures/test_image_url"
import Attachment from "trix/models/attachment"

export const insertString = function (string) {
  getComposition().insertString(string)
  render()
}

export const insertText = function (text) {
  getComposition().insertText(text)
  render()
}

export const insertDocument = function (document) {
  getComposition().insertDocument(document)
  render()
}

export const insertFile = function (file) {
  getComposition().insertFile(file)
  render()
}

export const insertAttachment = function (attachment) {
  getComposition().insertAttachment(attachment)
  render()
}

export const insertAttachments = function (attachments) {
  getComposition().insertAttachments(attachments)
  render()
}

export const insertImageAttachment = function (attributes) {
  const attachment = createImageAttachment(attributes)
  return insertAttachment(attachment)
}

export const createImageAttachment = function (attributes) {
  if (!attributes) {
    attributes = {
      url: TEST_IMAGE_URL,
      width: 10,
      height: 10,
      filename: "image.gif",
      filesize: 35,
      contentType: "image/gif",
    }
  }

  return new Attachment(attributes)
}

export const replaceDocument = function (document) {
  getComposition().setDocument(document)
  render()
}


const render = () => getEditorController().render()
