#= require trix/models/attachment
#= require trix/utilities/helpers

{forwardMethods} = Trix.Helpers

class Trix.ManagedAttachment
  # Forward all Attachment methods
  forwardMethods fromConstructor: this, toConstructor: Trix.Attachment, viaProperty: "attachment"

  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
