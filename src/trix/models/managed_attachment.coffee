#= require trix/models/attachment

class Trix.ManagedAttachment extends Trix.BasicObject
  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)

  @forward "attachment.getAttribute"
  @forward "attachment.hasAttribute"
  @forward "attachment.setAttribute"
  @forward "attachment.setAttributes"
  @forward "attachment.isPending"
  @forward "attachment.isImage"
  @forward "attachment.getURL"
  @forward "attachment.getHref"
  @forward "attachment.getFilename"
  @forward "attachment.getFilesize"
  @forward "attachment.getFormattedFilesize"
  @forward "attachment.getExtension"
  @forward "attachment.getContentType"
  @forward "attachment.getFile"
  @forward "attachment.setFile"
  @forward "attachment.releaseFile"
  @forward "attachment.getUploadProgress"
  @forward "attachment.setUploadProgress"
