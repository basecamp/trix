#= require trix/models/attachment

class Trix.ManagedAttachment
  # Forward all Attachment methods
  for own name, value of Trix.Attachment.prototype when name isnt "constructor" and typeof value is "function"
    do (name, value) =>
      @::[name] = -> @attachment[name].apply(@attachment, arguments)

  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
