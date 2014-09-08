#= require trix/views/attachment_view
#= require trix/utilities/helpers

{capitalize} = Trix.Helpers

class Trix.FileAttachmentView extends Trix.AttachmentView
  render: ->
    element = super
    element.classList.add("file")
    element.setAttribute("contenteditable", "false")
    if extension = @attachmentPiece.getExtension()
      element.classList.add(extension)

    caption = document.createElement("figcaption")
    caption.textContent = @attachmentPiece.getFilename()

    if filesize = @attachmentPiece.getFilesize()
      span = document.createElement("span")
      span.classList.add("size")
      span.textContent = filesize
      caption.appendChild(span)

    element.appendChild(caption)
    element
