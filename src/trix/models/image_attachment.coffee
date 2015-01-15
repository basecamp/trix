#= require trix/models/attachment
#= require trix/models/preload_image_operation

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
      @preloadOperation = new Trix.PreloadImageOperation url
      @preloadOperation.then => @releaseFile()

  createPreviewPreloadOperationForFile: (file) ->
    previewObjectURL = URL.createObjectURL(file)
    @previewPreloadOperation = new Trix.PreloadImageOperation previewObjectURL

  releasePreviewPreload: ->
    URL.revokeObjectURL(@previewPreloadOperation.url)
    @previewPreloadOperation.release()
    delete @previewPreloadOperation
