#= require trix/models/attachment

{forwardMethod} = Trix.Helpers

class Trix.ManagedAttachment
  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)

  forwardMethod "getAttribute", onConstructor: this, toProperty: "attachment"
  forwardMethod "hasAttribute", onConstructor: this, toProperty: "attachment"
  forwardMethod "getAttributes", onConstructor: this, toProperty: "attachment"
  forwardMethod "setAttributes", onConstructor: this, toProperty: "attachment"
  forwardMethod "isPending", onConstructor: this, toProperty: "attachment"
  forwardMethod "isImage", onConstructor: this, toProperty: "attachment"
  forwardMethod "getURL", onConstructor: this, toProperty: "attachment"
  forwardMethod "getHref", onConstructor: this, toProperty: "attachment"
  forwardMethod "getFilename", onConstructor: this, toProperty: "attachment"
  forwardMethod "getFilesize", onConstructor: this, toProperty: "attachment"
  forwardMethod "getFormattedFilesize", onConstructor: this, toProperty: "attachment"
  forwardMethod "getExtension", onConstructor: this, toProperty: "attachment"
  forwardMethod "getContentType", onConstructor: this, toProperty: "attachment"
  forwardMethod "getFile", onConstructor: this, toProperty: "attachment"
  forwardMethod "setFile", onConstructor: this, toProperty: "attachment"
  forwardMethod "releaseFile", onConstructor: this, toProperty: "attachment"
  forwardMethod "getUploadProgress", onConstructor: this, toProperty: "attachment"
  forwardMethod "setUploadProgress", onConstructor: this, toProperty: "attachment"
