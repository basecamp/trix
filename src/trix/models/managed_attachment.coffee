class Trix.ManagedAttachment
  constructor: (@attachment, @document) ->
    {@id, @file} = @attachment

  getAttributes: ->
    @document.getAttachmentPieceForAttachment(@attachment)?.getAttributes()

  setAttributes: (attributes) ->
    if attributes.url? or attributes.href?
      delete @attachment.file
      delete @attachment.previewURL
      delete @attachment.element
    @document.updateAttributesForAttachment(attributes, @attachment)

  setUploadProgress: (value) ->
    @attachment.element?.querySelector("progress")?.setAttribute("value", value)

  remove: ->
    if range = @document.getLocationRangeOfAttachment(@attachment)
      @document.removeTextAtLocationRange(range)

  isImage: ->
    @document.getAttachmentPieceForAttachment(@attachment)?.isImage()
