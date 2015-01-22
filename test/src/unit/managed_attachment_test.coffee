module "Trix.ManagedAttachment"

test "forwards methods to attachments from different constructors", ->
  manager = new Trix.AttachmentManager

  managedAttachment = new Trix.ManagedAttachment manager, new Trix.Attachment
  ok not managedAttachment.isImage()

  managedImageAttachment = new Trix.ManagedAttachment manager, new Trix.ImageAttachment
  ok managedImageAttachment.isImage()
