/*
trix/actiontext 2.1.15
Copyright © 2025 37signals, LLC
 */
import { AttachmentUpload } from '@rails/actiontext';

addEventListener("trix-attachment-add", event => {
  const {
    attachment,
    target
  } = event;
  if (attachment.file) {
    const upload = new AttachmentUpload(attachment, target, attachment.file);
    const onProgress = event => attachment.setUploadProgress(event.detail.progress);
    target.addEventListener("direct-upload:progress", onProgress);
    upload.start().then(attributes => attachment.setAttributes(attributes)).catch(error => alert(error)).finally(() => target.removeEventListener("direct-upload:progress", onProgress));
  }
});
