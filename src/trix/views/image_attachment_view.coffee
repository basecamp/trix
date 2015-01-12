#= require trix/views/attachment_view

{makeElement, measureElement} = Trix.DOM

class Trix.ImageAttachmentView extends Trix.AttachmentView
  createNodes: ->
    element = @createElement()
    element.classList.add("image")
    image = makeElement("img")

    if @attachment.isPending()
      @attachment.getPreviewURL (previewURL) =>
        image.src = previewURL
    else
      image.src = @attachment.getURL()

    if @attachmentPiece.getWidth()?
      image.width = @attachmentPiece.getWidth()
      image.height = @attachmentPiece.getHeight()
    else
      image.addEventListener "load", ->
        {width, height} = measureElement(image)
        image.width = width
        image.height = height

    element.appendChild(image)
    [element]
