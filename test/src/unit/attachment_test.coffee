{assert, test, testGroup} = Trix.TestHelpers

testGroup "Trix.Attachment", ->
  previewableTypes = "image image/gif image/png image/jpg".split(" ")
  nonPreviewableTypes = "image/tiff application/foo".split(" ")

  createAttachment = (attributes) ->
    new Trix.Attachment attributes

  for contentType in previewableTypes then do (contentType) ->
    test "#{contentType} content type is previewable", ->
      assert.ok createAttachment({contentType}).isPreviewable()

  for contentType in nonPreviewableTypes then do (contentType) ->
    test "#{contentType} content type is NOT previewable", ->
      assert.notOk createAttachment({contentType}).isPreviewable()

  test "'previewable' attribute determines previewability", ->
    attrs = previewable: true, contentType: nonPreviewableTypes[0]
    assert.ok createAttachment(attrs).isPreviewable()

    attrs = previewable: false, contentType: previewableTypes[0]
    assert.notOk createAttachment(attrs).isPreviewable()

  test "empty string content attribute is removed from hash", ->
    attrs = content: ''
    attachment = createAttachment()
    attachment.setAttributes(attrs)
    assert.strictEqual attachment.getContent undefined

    attrs = content: ' '
    attachment = createAttachment()
    attachment.setAttributes(attrs)
    assert.strictEqual attachment.getContent undefined

    attrs = {}
    attachment = createAttachment()
    attachment.setAttributes(attrs)