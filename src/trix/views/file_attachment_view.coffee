#= require trix/views/attachment_view

{makeElement} = Trix

class Trix.FileAttachmentView extends Trix.AttachmentView
  createContentNodes: -> []

  getClassName: ->
    names = [super, "file"]
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")
