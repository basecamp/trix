#= require trix/models/collection

class Trix.AttachmentManager
  constructor: (@text, @responder) ->
    @text.attachments = this
    @collection = new Trix.Collection
    @reset()

  add: (attachment) ->
    unless @collection.has(attachment.id)
      object = @attachmentObjectWithCallbacks(attachment)
      unless @responder.addAttachment?(object) is false
        @collection.add(attachment)

  remove: (id) ->
    if attachment = @collection.remove(id)
      @responder.removeAttachment?(attachment.toObject())

  reset: ->
    attachments = @text.getAttachments()

    for attachment in @collection.toArray() when attachment not in attachments
      @remove(attachment.id)

    for attachment in attachments
      @add(attachment)

  attachmentObjectWithCallbacks: (attachment) ->
    object = attachment.toObject()

    object.update = (attributes) =>
      attachment.setAttributes(attributes)
      @text.delegate?.didEditText?(@text)

    object.remove = =>
      position = @text.pieceList.getPositionOfAttachment(attachment)
      @text.removeTextAtRange([position, position + 1])

    object
