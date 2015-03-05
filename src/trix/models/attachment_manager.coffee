#= require trix/models/managed_attachment

class Trix.AttachmentManager extends Trix.BasicObject
  constructor: (attachments = []) ->
    @managedAttachments = {}
    @manageAttachment(attachment) for attachment in attachments

  getAttachments: ->
    attachment for id, attachment of @managedAttachments

  manageAttachment: (attachment) ->
    @managedAttachments[attachment.id] ?= new Trix.ManagedAttachment this, attachment

  attachmentIsManaged: (attachment) ->
    attachment.id of @managedAttachments

  requestRemovalOfAttachment: (attachment) ->
    if @attachmentIsManaged(attachment)
      @delegate?.attachmentManagerDidRequestRemovalOfAttachment?(attachment)

  unmanageAttachment: (attachment) ->
    managedAttachment = @managedAttachments[attachment.id]
    delete @managedAttachments[attachment.id]
    managedAttachment
