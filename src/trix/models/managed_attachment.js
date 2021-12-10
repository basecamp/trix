// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ManagedAttachment
import "trix/models/attachment"
import BasicObject from "trix/core/basic_object"

export default ManagedAttachment = (function() {
  ManagedAttachment = class ManagedAttachment extends BasicObject {
    static initClass() {

      this.proxyMethod("attachment.getAttribute")
      this.proxyMethod("attachment.hasAttribute")
      this.proxyMethod("attachment.setAttribute")
      this.proxyMethod("attachment.getAttributes")
      this.proxyMethod("attachment.setAttributes")
      this.proxyMethod("attachment.isPending")
      this.proxyMethod("attachment.isPreviewable")
      this.proxyMethod("attachment.getURL")
      this.proxyMethod("attachment.getHref")
      this.proxyMethod("attachment.getFilename")
      this.proxyMethod("attachment.getFilesize")
      this.proxyMethod("attachment.getFormattedFilesize")
      this.proxyMethod("attachment.getExtension")
      this.proxyMethod("attachment.getContentType")
      this.proxyMethod("attachment.getFile")
      this.proxyMethod("attachment.setFile")
      this.proxyMethod("attachment.releaseFile")
      this.proxyMethod("attachment.getUploadProgress")
      this.proxyMethod("attachment.setUploadProgress")
    }
    constructor(attachmentManager, attachment) {
      super(...arguments)
      this.attachmentManager = attachmentManager
      this.attachment = attachment;
      ({ id: this.id, file: this.file } = this.attachment)
    }

    remove() {
      return this.attachmentManager.requestRemovalOfAttachment(this.attachment)
    }
  }
  ManagedAttachment.initClass()
  return ManagedAttachment
})()
