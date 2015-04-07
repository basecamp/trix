module "Trix.Attachment"

previewableTypes = "image image/gif image/png image/jpg".split(" ")
nonPreviewableTypes = "image/tiff application/foo".split(" ")

for contentType in previewableTypes then do (contentType) ->
  test "#{contentType} content type is previewable", ->
    ok Trix.Attachment.attachmentForAttributes({contentType}).isPreviewable()

for contentType in nonPreviewableTypes then do (contentType) ->
  test "#{contentType} content type is NOT previewable", ->
    ok not Trix.Attachment.attachmentForAttributes({contentType}).isPreviewable()

