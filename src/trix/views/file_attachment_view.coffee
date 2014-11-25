#= require trix/views/attachment_view

{capitalize} = Trix.Helpers
{makeElement} = Trix.DOM

class Trix.FileAttachmentView extends Trix.AttachmentView
  createNodes: ->
    element = @createElement()
    element.classList.add("file")
    if extension = @attachment.getExtension()
      element.classList.add(extension)

    caption = makeElement(tagName: "figcaption", textContent: @attachment.getFilename())

    if filesize = @attachment.getFilesize()
      span = makeElement(tagName: "span", className: "size", textContent: filesize)
      caption.appendChild(span)

    element.appendChild(caption)
    [element]
