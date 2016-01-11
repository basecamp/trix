{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.Document", ->
  createDocumentWithAttachment = (attachment) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment)
    new Trix.Document [new Trix.Block text]

  test "documents with different attachments are not assert.equal", ->
    a = createDocumentWithAttachment(new Trix.Attachment url: "a")
    b = createDocumentWithAttachment(new Trix.Attachment url: "b")
    assert.notOk a.isEqualTo(b)
