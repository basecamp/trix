/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { TEST_IMAGE_URL } from "test/test_helpers/fixtures/test_image_url";

import Attachment from "trix/models/attachment";

export var insertString = function(string) {
  getComposition().insertString(string);
  return render();
};

export var insertText = function(text) {
  getComposition().insertText(text);
  return render();
};

export var insertDocument = function(document) {
  getComposition().insertDocument(document);
  return render();
};

export var insertFile = function(file) {
  getComposition().insertFile(file);
  return render();
};

export var insertAttachment = function(attachment) {
  getComposition().insertAttachment(attachment);
  return render();
};

export var insertAttachments = function(attachments) {
  getComposition().insertAttachments(attachments);
  return render();
};

export var insertImageAttachment = function(attributes) {
  const attachment = createImageAttachment(attributes);
  return insertAttachment(attachment);
};

export var createImageAttachment = function(attributes) {
  if (attributes == null) { attributes = {
    url: TEST_IMAGE_URL,
    width: 10,
    height: 10,
    filename: "image.gif",
    filesize: 35,
    contentType: "image/gif"
  }; }

  return new Attachment(attributes);
};

export var replaceDocument = function(document) {
  getComposition().setDocument(document);
  return render();
};

var render = () => getEditorController().render();
