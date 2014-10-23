#= require trix/models/attachment
#= require trix/utilities/helpers

{forwardMethods} = Trix.Helpers

class Trix.ManagedAttachment
  # Forward all Attachment methods
  forwardMethods ofConstructor: Trix.Attachment, onConstructor: this, toProperty: "attachment"

  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
