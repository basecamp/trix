class Trix.AttachmentManager
  constructor: (attachments = [], config) ->
    @attachments = {}
    @host = config?.delegate
    @saveAttachments(attachments)

  addAttachment: (attachment) ->
    unless @notifyHost("attachmentAdded", attachment) is false
      @saveAttachment(attachment)

  replaceAttachments: (newAttachments) ->
    for id, attachment of @attachments when attachment not in newAttachments
      @removeAttachment(attachment)
    @saveAttachments(newAttachments)

  # Private

  saveAttachments: (attachments) ->
    @saveAttachment(attachment) for attachment in attachments

  saveAttachment: (attachment) ->
    @attachments[attachment.id] = attachment

  removeAttachment: (attachment) ->
    delete @attachments[attachment.id]
    @notifyHost("attachmentRemoved", attachment)

  notifyHost: (message, args...) ->
    @host?[message]?(args...)
