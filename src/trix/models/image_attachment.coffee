#= require trix/models/attachment
#= require trix/models/image_resource

class Trix.ImageAttachment extends Trix.Attachment
  isImage: ->
    true

  setFile: (file) ->
    @createPreviewResourceForFile(file)
    super

  releaseFile: ->
    @releasePreviewResource()
    super

  didChangeAttributes: ->
    url = @getURL()
    if url? and not @resource
      @resource = new Trix.ImageResource url
      @resource.performWhenLoaded => @releaseFile()

  createPreviewResourceForFile: (file) ->
    @previewObjectURL = URL.createObjectURL(file)
    @previewResource = new Trix.ImageResource @previewObjectURL

  releasePreviewResource: ->
    URL.revokeObjectURL(@previewObjectURL)
    delete @previewObjectURL

    @previewResource.release()
    delete @previewResource
