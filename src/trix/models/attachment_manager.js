/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import ManagedAttachment from "trix/models/managed_attachment";
import BasicObject from "trix/core/basic_object";

export default class AttachmentManager extends BasicObject {
  constructor(attachments = []) {
    super(...arguments);
    this.managedAttachments = {};
    for (let attachment of Array.from(attachments)) { this.manageAttachment(attachment); }
  }

  getAttachments() {
    return (() => {
      const result = [];
      for (let id in this.managedAttachments) {
        const attachment = this.managedAttachments[id];
        result.push(attachment);
      }
      return result;
    })();
  }

  manageAttachment(attachment) {
    return this.managedAttachments[attachment.id] != null ? this.managedAttachments[attachment.id] : (this.managedAttachments[attachment.id] = new ManagedAttachment(this, attachment));
  }

  attachmentIsManaged(attachment) {
    return attachment.id in this.managedAttachments;
  }

  requestRemovalOfAttachment(attachment) {
    if (this.attachmentIsManaged(attachment)) {
      return this.delegate?.attachmentManagerDidRequestRemovalOfAttachment?.(attachment);
    }
  }

  unmanageAttachment(attachment) {
    const managedAttachment = this.managedAttachments[attachment.id];
    delete this.managedAttachments[attachment.id];
    return managedAttachment;
  }
}
