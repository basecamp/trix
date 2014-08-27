#= require trix/views/attachment_view

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    element = super
    image = document.createElement("img")

    if @attachmentPiece.isPending()
      @attachment.getPreviewURL (previewURL) =>
        image.ignoreNextMutation = true
        image.src = previewURL
    else
      image.src = @attachmentPiece.getURL()

    if @attachmentPiece.getWidth()?
      image.width = @attachmentPiece.getWidth()
      image.height = @attachmentPiece.getHeight()

    element.appendChild(image)
    element
