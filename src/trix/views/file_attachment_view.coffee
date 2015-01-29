#= require trix/views/attachment_view

{makeElement} = Trix

class Trix.FileAttachmentView extends Trix.AttachmentView
  createContentNodes: ->
    caption = makeElement(tagName: "figcaption", textContent: @attachment.getFilename())

    if filesize = @attachment.getFormattedFilesize()
      span = makeElement(tagName: "span", className: "size", textContent: filesize)
      caption.appendChild(span)

    [caption]

  getClassName: ->
    names = [super, "file"]
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")
