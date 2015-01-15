#= require trix/views/attachment_view
#= require trix/models/image_attachment

{defer} = Trix.Helpers
{makeElement, measureElement} = Trix.DOM

class Trix.ImageAttachmentView extends Trix.AttachmentView
  getResource: ->
    if @attachment.resource?.isLoaded()
      @attachment.resource
    else if @attachment.previewResource?
      @attachment.previewResource
    else
      @attachment.resource

  createNodes: ->
    element = @createElement()
    element.classList.add("image")

    image = makeElement("img")
    element.appendChild(image)
    @refresh(element)

    if resource = @attachment.resource
      resource.performWhenLoaded =>
        @refresh(element)
        @refresh()

    [element]

  refresh: (element = @findElement()) ->
    if image = element?.querySelector("img")
      @updateAttributesForImage(image)

  updateAttributesForImage: (image) ->
    resource = @getResource()
    image.src = resource.url

    if @attachmentPiece.getWidth()?
      image.width = @attachmentPiece.getWidth()
      image.height = @attachmentPiece.getHeight()
    else
      resource.getImageDimensions ({width, height}) ->
        image.width = width
        image.height = height
