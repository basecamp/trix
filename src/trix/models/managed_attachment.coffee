#= require trix/models/attachment

class Trix.ManagedAttachment extends Trix.BasicObject
  constructor: (@attachmentManager, @attachment) ->
    {@id, @file} = @attachment

  remove: ->
    @attachmentManager.requestRemovalOfAttachment(@attachment)

  @proxyMethod "attachment.getAttribute"
  @proxyMethod "attachment.hasAttribute"
  @proxyMethod "attachment.setAttribute"
  @proxyMethod "attachment.getAttributes"
  @proxyMethod "attachment.setAttributes"
  @proxyMethod "attachment.isPending"
  @proxyMethod "attachment.isPreviewable"
  @proxyMethod "attachment.getURL"
  @proxyMethod "attachment.getHref"
  @proxyMethod "attachment.getFilename"
  @proxyMethod "attachment.getFilesize"
  @proxyMethod "attachment.getFormattedFilesize"
  @proxyMethod "attachment.getExtension"
  @proxyMethod "attachment.getContentType"
  @proxyMethod "attachment.getFile"
  @proxyMethod "attachment.setFile"
  @proxyMethod "attachment.releaseFile"
  @proxyMethod "attachment.getUploadProgress"
  @proxyMethod "attachment.setUploadProgress"
