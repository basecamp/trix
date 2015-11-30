module "Trix.Document"

test "documents with different attachments are not equal", ->
  a = createDocumentWithAttachment(new Trix.Attachment url: "a")
  b = createDocumentWithAttachment(new Trix.Attachment url: "b")
  ok not a.isEqualTo(b)

createDocumentWithAttachment = (attachment) ->
  text = Trix.Text.textForAttachmentWithAttributes(attachment)
  new Trix.Document [new Trix.Block text]
