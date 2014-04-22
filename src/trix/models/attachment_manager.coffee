#= require trix/models/collection
#= require trix/models/attachment

class Trix.AttachmentManager
  constructor: (@text) ->
    @collection = new Trix.Collection

  get: (id) ->
    @collection.get(id)

  add: (attachment) ->
    unless @collection.has(attachment.id)
      @collection.add(attachment)
      object = @attachmentObjectWithCallbacks(attachment)
      @delegate?.didAddAttachment?(object)
      attachment

  create: (file) ->
    if @delegate?.shouldAcceptFile?(file)
      @add(Trix.Attachment.forFile(file))

  remove: (id) ->
    if attachment = @collection.remove(id)
      @delegate?.didRemoveAttachment?(attachment.toObject())

  reset: ->
    attachments = @text.getAttachments()

    for attachment in @collection.difference(attachments)
      @remove(attachment.id)

    for attachment in attachments
      @add(attachment)

  attachmentObjectWithCallbacks: (attachment) ->
    object = attachment.toObject()

    object.update = (attributes) =>
      @text.setAttachmentAttributes(attachment.id, attributes)

    object.remove = =>
      @text.removeAttachment(attachment.id)

    object
