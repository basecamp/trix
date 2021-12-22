import ManagedAttachment from "trix/models/managed_attachment"
import BasicObject from "trix/core/basic_object"

export default class AttachmentManager extends BasicObject {
  constructor(attachments = []) {
    super(...arguments)
    this.managedAttachments = {}
    Array.from(attachments).forEach((attachment) => {
      this.manageAttachment(attachment)
    })
  }

  getAttachments() {
    const result = []
    for (const id in this.managedAttachments) {
      const attachment = this.managedAttachments[id]
      result.push(attachment)
    }
    return result
  }

  manageAttachment(attachment) {
    if (!this.managedAttachments[attachment.id]) {
      this.managedAttachments[attachment.id] = new ManagedAttachment(this, attachment)
    }
    return this.managedAttachments[attachment.id]
  }

  attachmentIsManaged(attachment) {
    return attachment.id in this.managedAttachments
  }

  requestRemovalOfAttachment(attachment) {
    if (this.attachmentIsManaged(attachment)) {
      return this.delegate?.attachmentManagerDidRequestRemovalOfAttachment?.(attachment)
    }
  }

  unmanageAttachment(attachment) {
    const managedAttachment = this.managedAttachments[attachment.id]
    delete this.managedAttachments[attachment.id]
    return managedAttachment
  }
}
