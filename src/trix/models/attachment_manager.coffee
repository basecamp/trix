#= require trix/utilities/collection
#= require trix/models/attachment

class Trix.AttachmentManager
  constructor: (@owner) ->
    @collection = new Trix.Collection

  get: (id) ->
    @collection.get(id)

  findWhere: (attributes) ->
    @collection.findWhere(attributes)

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
    attachments = @owner.getAttachments()

    for attachment in @collection.difference(attachments)
      @remove(attachment.id)

    for attachment in attachments
      @add(attachment)

  attachmentObjectWithCallbacks: (attachment) ->
    object = attachment.toObject()

    object.update = (attributes) =>
      @owner.updateAttachment(attachment.id, attributes)

    object.remove = =>
      @owner.removeAttachment(attachment.id)

    object
