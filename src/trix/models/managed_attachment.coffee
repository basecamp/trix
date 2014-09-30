#= require trix/models/attachment

# TODO: ManagedAttachment should merge intrinsic and visual attributes into a single hash

class Trix.ManagedAttachment
  # Forward all Attachment methods
  for name, value of Trix.Attachment.prototype when typeof value is "function" then do (name, value) =>
    @::[name] = -> @attachment[name].call(@attachment, arguments)

  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment
    {@document} = @attachmentManager

  setUploadProgress: (value) ->
    document.getElementById("trix-progress-#{@id}")?.setAttribute("value", value)

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)
