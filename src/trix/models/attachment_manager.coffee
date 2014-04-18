class Trix.AttachmentManager
  constructor: (attachments = []) ->
    @attachments = {}
    @reset(attachments)

  add: (attachment) ->
    unless @get(attachment.id)
      unless @notifyDelegate("attachmentAdded", attachment) is false
        @attachments[attachment.id] = attachment

  remove: (attachment) ->
    if @get(attachment.id)
      delete @attachments[attachment.id]
      @notifyDelegate("attachmentRemoved", attachment)

  get: (id) ->
    @attachments[id]

  reset: (attachments = []) ->
    for id, attachment of @attachments when attachment not in attachments
      @remove(attachment)

    for attachment in attachments
      @add(attachment)

  notifyDelegate: (message, args...) ->
    @delegate?[message]?(args...)
