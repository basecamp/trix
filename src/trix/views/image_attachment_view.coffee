#= require trix/views/attachment_view
#= require trix/lib/dom
#= require trix/lib/helpers

{defer} = Trix.Helpers

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    @image = document.createElement("img")
    @image.onload = @recordOriginalDimensions
    @loadImagePreview()
    @updateAttributes()
    @image

  loadImagePreview: ->
    if @attachment.isPending()
      getDataURL @attachment.file, @setInitialAttributes

  setInitialAttributes: (src) =>
    if @attachment.isPending()
      @image.setAttribute("src", src)

  recordOriginalDimensions: =>
    dimensions = Trix.DOM.getDimensions(@image)
    @attachment.setAttributes(dimensions)

  attributeNames = ["url", "class"]

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

  resize: ({width, height} = {}) ->
    width ?= @attachment.attributes.width
    height ?= @attachment.attributes.height
    @image.width = width if width?
    @image.height = height if height?

  getDataURL = (file, callback) ->
    reader = new FileReader
    reader.onload = (event) -> callback(event.target.result)
    reader.readAsDataURL(file)
