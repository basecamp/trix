trix.testGroup "Trix.Attachment", ->
  previewableTypes = "image image/gif image/png image/jpg".split(" ")
  nonPreviewableTypes = "image/tiff application/foo".split(" ")

  createAttachment = (attributes) ->
    new Trix.Attachment attributes

  for contentType in previewableTypes then do (contentType) ->
    trix.test "#{contentType} content type is previewable", ->
      trix.assert.ok createAttachment({contentType}).isPreviewable()

  for contentType in nonPreviewableTypes then do (contentType) ->
    trix.test "#{contentType} content type is NOT previewable", ->
      trix.assert.notOk createAttachment({contentType}).isPreviewable()

  trix.test "'previewable' attribute determines previewability", ->
    attrs = previewable: true, contentType: nonPreviewableTypes[0]
    trix.assert.ok createAttachment(attrs).isPreviewable()

    attrs = previewable: false, contentType: previewableTypes[0]
    trix.assert.notOk createAttachment(attrs).isPreviewable()
