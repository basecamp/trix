#= require trix/models/managed_attachment

class Trix.AttachmentManager
  constructor: (@editorController) ->
    {@document} = @editorController
    @managedAttachments = {}

  addAttachment: (attachment) ->
    @managedAttachments[attachment.id] ?= new Trix.ManagedAttachment this, attachment

  removeAttachment: (attachment) ->
    managedAttachment = @managedAttachments[attachment.id]
    delete @managedAttachments[attachment.id]
    managedAttachment
