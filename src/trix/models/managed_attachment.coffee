#= require trix/models/attachment

class Trix.ManagedAttachment
  # Forward all Attachment methods
  for own name, value of Trix.Attachment.prototype when name isnt "constructor" and typeof value is "function"
    do (name, value) =>
      @::[name] = -> @attachment[name].call(@attachment, arguments)

  constructor: (@attachmentManager, @attachment) ->
    {@id} = @attachment

  setUploadProgress: (value) ->
    document.getElementById("trix-progress-#{@id}")?.setAttribute("value", value)

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
