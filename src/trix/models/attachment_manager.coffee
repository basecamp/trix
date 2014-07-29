#= require trix/utilities/collection
#= require trix/models/attachment

class Trix.AttachmentManager
  constructor: (@document) ->
    @collection = new Trix.Collection

  get: (id) ->
    @collection.get(id)

  findWhere: (attributes) ->
    @collection.findWhere(attributes)

  add: (attachment) ->
    unless @collection.has(attachment.id)
      attachment = attachment.toAttachmentForDocument(@document)
      @collection.add(attachment)
      @delegate?.didAddAttachment?(attachment)
      attachment

  create: (file) ->
    if @delegate?.shouldAcceptFile?(file)
      new Trix.Attachment file

  remove: (id) ->
    if attachment = @collection.remove(id)
      @delegate?.didRemoveAttachment?(attachment)

  refresh: ->
    attachments = @document.getAttachments()

    for attachment in @collection.difference(attachments)
      @remove(attachment.id)

    for attachment in attachments
      @add(attachment)
