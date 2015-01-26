#= require trix/models/attachment

class Trix.ManagedAttachment extends Trix.BasicObject
  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)

  @proxy "attachment.getAttribute"
  @proxy "attachment.hasAttribute"
  @proxy "attachment.setAttribute"
  @proxy "attachment.setAttributes"
  @proxy "attachment.isPending"
  @proxy "attachment.isImage"
  @proxy "attachment.getURL"
  @proxy "attachment.getHref"
  @proxy "attachment.getFilename"
  @proxy "attachment.getFilesize"
  @proxy "attachment.getFormattedFilesize"
  @proxy "attachment.getExtension"
  @proxy "attachment.getContentType"
  @proxy "attachment.getFile"
  @proxy "attachment.setFile"
  @proxy "attachment.releaseFile"
  @proxy "attachment.getUploadProgress"
  @proxy "attachment.setUploadProgress"
