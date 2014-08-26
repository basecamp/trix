#= require trix/views/attachment_view
#= require trix/utilities/dom
#= require trix/utilities/helpers

{capitalize} = Trix.Helpers

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    @image = document.createElement("img")

    for key, value of @attachmentPiece.getMetadata()
      @image.dataset["trix#{capitalize(key)}"] = value

    if @attachmentPiece.isPending()
      @image.setAttribute("data-trix-pending", "true")
      @attachment.getPreviewURL (previewURL) =>
        @image.ignoreNextMutation = true
        @image.src = previewURL
    else
      @image.src = @attachmentPiece.getURL()

    if @attachmentPiece.getWidth()?
      @image.width = @attachmentPiece.getWidth()
      @image.height = @attachmentPiece.getHeight()

    @image
