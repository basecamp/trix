module "Trix.Document"

test "doesn't mutate the delegate of its attachments", ->
  {document} = fixtures["image attachment"]
  attachment = document.getAttachments()[0]

  equal attachment.delegate?.id, document.id
  document.copy()
  equal attachment.delegate?.id, document.id
