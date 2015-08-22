module "Trix.Attachment"

previewableTypes = "image image/gif image/png image/jpg".split(" ")
nonPreviewableTypes = "image/tiff application/foo".split(" ")

for contentType in previewableTypes then do (contentType) ->
  test "#{contentType} content type is previewable", ->
    ok createAttachment({contentType}).isPreviewable()

for contentType in nonPreviewableTypes then do (contentType) ->
  test "#{contentType} content type is NOT previewable", ->
    ok not createAttachment({contentType}).isPreviewable()

test "'previewable' attribute determines previewability", ->
  attrs = previewable: true, contentType: nonPreviewableTypes[0]
  ok createAttachment(attrs).isPreviewable()

  attrs = previewable: false, contentType: previewableTypes[0]
  ok not createAttachment(attrs).isPreviewable()


createAttachment = (attributes) ->
  new Trix.Attachment attributes
