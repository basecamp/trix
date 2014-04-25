#= require trix/views/attachment_view
#= require trix/lib/helpers

{defer} = Trix.Helpers

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    @image = document.createElement("img")
    @loadImagePreview()
    @updateAttributes()
    @image

  loadImagePreview: ->
    if @attachment.isPending()
      getDataURL @attachment.file, @setInitialAttributes

  setInitialAttributes: (src) =>
    if @attachment.isPending()
      @image.setAttribute("src", src)
      defer => @attachment.setAttributes(@getImageDimensions())

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

  getImageDimensions: ->
    width:  @image.offsetWidth
    height: @image.offsetHeight

  getDataURL = (file, callback) ->
    reader = new FileReader
    reader.onload = (event) -> callback(event.target.result)
    reader.readAsDataURL(file)
