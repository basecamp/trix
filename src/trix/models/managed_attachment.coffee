class Trix.ManagedAttachment
  constructor: (@attachment, @document) ->
    {@id, @file} = @attachment

  getAttributes: ->
    @document.getAttachmentPieceForAttachment(@attachment)?.getAttributes()

  setAttributes: (attributes) ->
    if attributes.url?
      delete @attachment.file
      delete @attachment.previewURL
    @document.updateAttributesForAttachment(attributes, @attachment)

  setUploadProgress: (value) ->
    document.getElementById("trix-progress-#{@id}")?.setAttribute("value", value)

  remove: ->
    if range = @document.getLocationRangeOfAttachment(@attachment)
      @document.removeTextAtLocationRange(range)

  isImage: ->
    @document.getAttachmentPieceForAttachment(@attachment)?.isImage()
