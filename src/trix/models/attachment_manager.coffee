class Trix.AttachmentManager
  constructor: (attachments = [], config) ->
    @attachments = {}
    @host = config?.delegate
    @context = config?.textElement
    @saveAttachments(attachments)

  addAttachment: (attachment) ->
    unless @notifyHost("fileAdded", attachment.file, attachment.setAttributes) is false
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
    @notifyHost("fileRemoved", attachment.toJSON())

  notifyHost: (message, args...) ->
    @host?[message]?.apply(@context, args)
