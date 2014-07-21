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
      @collection.add(attachment)
      attachment.delegate = @document
      @delegate?.didAddAttachment?(attachment)
      attachment

  create: (file) ->
    if @delegate?.shouldAcceptFile?(file)
      @add(Trix.Attachment.forFile(file))

  remove: (id) ->
    if attachment = @collection.remove(id)
      delete attachment.delegate
      @delegate?.didRemoveAttachment?(attachment)

  reset: ->
    attachments = @document.getAttachments()

    for attachment in @collection.difference(attachments)
      @remove(attachment.id)

    for attachment in attachments
      @add(attachment)
