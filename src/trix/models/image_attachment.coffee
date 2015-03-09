#= require trix/models/attachment
#= require trix/operations/image_preload_operation

class Trix.ImageAttachment extends Trix.Attachment
  isImage: ->
    true

  setFile: (file) ->
    @createPreviewPreloadOperationForFile(file)
    super

  releaseFile: ->
    @releasePreviewPreload()
    super

  didChangeAttributes: ->
    url = @getURL()
    if url? and not @preloadOperation
      @preloadOperation = new Trix.ImagePreloadOperation url
      @preloadOperation.then ({width, height}) =>
        @setAttributes({width, height})
        @releaseFile()

  createPreviewPreloadOperationForFile: (file) ->
    previewObjectURL = URL.createObjectURL(file)
    @previewPreloadOperation = new Trix.ImagePreloadOperation previewObjectURL
    @previewPreloadOperation.then ({width, height}) =>
      @setAttributes({width, height})

  releasePreviewPreload: ->
    if @previewPreloadOperation
      URL.revokeObjectURL(@previewPreloadOperation.url)
      @previewPreloadOperation.release()
      delete @previewPreloadOperation
