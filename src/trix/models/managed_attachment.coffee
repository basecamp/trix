#= require trix/models/attachment

{forwardMethods} = Trix.Helpers

class Trix.ManagedAttachment
  constructor: (@attachmentManager, @attachment) ->
    forwardMethods ofObject: @attachment, toObject: this
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
