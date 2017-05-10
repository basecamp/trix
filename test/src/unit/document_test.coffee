{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.Document", ->
  createDocumentWithAttachment = (attachment) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment)
    new Trix.Document [new Trix.Block text]

  test "documents with different attachments are not equal", ->
    a = createDocumentWithAttachment(new Trix.Attachment url: "a")
    b = createDocumentWithAttachment(new Trix.Attachment url: "b")
    assert.notOk a.isEqualTo(b)

  test "getStringAtRange does not leak trailing block breaks", ->
    document = Trix.Document.fromString("Hey")
    assert.equal document.getStringAtRange([0, 0]), ""
    assert.equal document.getStringAtRange([0, 1]), "H"
    assert.equal document.getStringAtRange([0, 2]), "He"
    assert.equal document.getStringAtRange([0, 3]), "Hey"
    assert.equal document.getStringAtRange([0, 4]), "Hey\n"
