#= require trix/views/attachment_view

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    element = super
    element.classList.add("image")
    image = document.createElement("img")
    image.trixAttachmentId = @attachment.id

    if @attachmentPiece.isPending()
      @attachment.getPreviewURL (previewURL) =>
        image.src = previewURL
    else
      image.src = @attachmentPiece.getURL()

    if @attachmentPiece.getWidth()?
      image.width = @attachmentPiece.getWidth()
      image.height = @attachmentPiece.getHeight()

    element.appendChild(image)
    element
