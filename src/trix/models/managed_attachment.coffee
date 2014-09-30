# TODO: ManagedAttachment should merge intrinsic and visual attributes into a single hash

class Trix.ManagedAttachment
  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment
    {@document} = @attachmentManager

  getAttributes: ->
    @attachment.getAttributes()

  setAttributes: (attributes) ->
    if attributes.url?
      delete @attachment.file
      delete @attachment.previewURL
    @document.updateAttributesForAttachment(attributes, @attachment)

  setUploadProgress: (value) ->
    document.getElementById("trix-progress-#{@id}")?.setAttribute("value", value)

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)

  isImage: ->
    @document.getAttachmentPieceForAttachment(@attachment)?.isImage()
