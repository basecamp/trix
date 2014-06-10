#= require trix/views/attachment_view
#= require trix/utilities/dom
#= require trix/utilities/helpers

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

  updateAttributes: ->
    klass = if @attachment.isPending() then "pending-attachment" else @attachment.attributes.class
    updateAttribute(@image, "class", klass)

    url = @attachment.attributes.url
    updateAttribute(@image, "src", url)

  updateAttribute = (element, attribute, value) ->
    if value?
      if element.getAttribute(attribute) isnt value
        element.setAttribute(attribute, value)
    else if element.hasAttribute(attribute)
      element.removeAttribute(attribute, value)

  resize: ({width, height} = {}) ->
    width ?= @attachment.attributes.width
    height ?= @attachment.attributes.height
    @image.width = width if width?
    @image.height = height if height?

  getDataURL = (file, callback) ->
    reader = new FileReader
    reader.onload = (event) -> callback(event.target.result)
    reader.readAsDataURL(file)
