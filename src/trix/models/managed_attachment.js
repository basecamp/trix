import "trix/models/attachment"
import BasicObject from "trix/core/basic_object"

export default class ManagedAttachment extends BasicObject {
  constructor(attachmentManager, attachment) {
    super(...arguments)
    this.attachmentManager = attachmentManager
    this.attachment = attachment
    this.id = this.attachment.id
    this.file = this.attachment.file
  }

  remove() {
    return this.attachmentManager.requestRemovalOfAttachment(this.attachment)
  }
}

ManagedAttachment.proxyMethod("attachment.getAttribute")
ManagedAttachment.proxyMethod("attachment.hasAttribute")
ManagedAttachment.proxyMethod("attachment.setAttribute")
ManagedAttachment.proxyMethod("attachment.getAttributes")
ManagedAttachment.proxyMethod("attachment.setAttributes")
ManagedAttachment.proxyMethod("attachment.isPending")
ManagedAttachment.proxyMethod("attachment.isPreviewable")
ManagedAttachment.proxyMethod("attachment.getURL")
ManagedAttachment.proxyMethod("attachment.getHref")
ManagedAttachment.proxyMethod("attachment.getFilename")
ManagedAttachment.proxyMethod("attachment.getFilesize")
ManagedAttachment.proxyMethod("attachment.getFormattedFilesize")
ManagedAttachment.proxyMethod("attachment.getExtension")
ManagedAttachment.proxyMethod("attachment.getContentType")
ManagedAttachment.proxyMethod("attachment.getFile")
ManagedAttachment.proxyMethod("attachment.setFile")
ManagedAttachment.proxyMethod("attachment.releaseFile")
ManagedAttachment.proxyMethod("attachment.getUploadProgress")
ManagedAttachment.proxyMethod("attachment.setUploadProgress")

