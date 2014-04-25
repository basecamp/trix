#= require trix/views/attachment_view
#= require trix/lib/helpers

{defer} = Trix.Helpers

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    @image = document.createElement("img")
    @loadFile() if @attachment.isPending()
    @updateAttributes()
    @image

  loadFile: ->
    reader = new FileReader
    reader.onload = (event) =>
      if @attachment.isPending()
        @image.setAttribute("src", event.target.result)
        defer => @attachment.setAttributes(width: @image.offsetWidth, height: @image.offsetHeight)
    reader.readAsDataURL(@attachment.file)

  attributeNames = "url width height class".split(" ")

  updateAttributes: ->
    attributes = {}

    for key in attributeNames
      attributes[key] = @attachment.attributes[key]

    if attributes.url
      attributes.src = attributes.url
      delete attributes.url

    if @attachment.isPending()
      attributes.class = "pending-attachment"

    for key, value of attributes
      if value?
        @image.setAttribute(key, value)
      else
        @image.removeAttribute(key)
