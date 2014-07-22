#= require trix/views/attachment_view
#= require trix/utilities/dom
#= require trix/utilities/helpers

{defer} = Trix.Helpers

class Trix.ImageAttachmentView extends Trix.AttachmentView
  render: ->
    @image = document.createElement("img")
    @image.setAttribute("contenteditable", false)
    @image.setAttribute("data-trix-identifier", @attachmentPiece.getIdentifier()) if @attachmentPiece.hasIdentifier()
    @image.onload = @recordOriginalDimensions
    @image.src = @attachmentPiece.getURL()
    @loadImagePreview()
    @image

  loadImagePreview: ->
    if @attachment.file
      getDataURL @attachment.file, @setInitialAttributes

  setInitialAttributes: (src) =>
    if @attachmentPiece.isPending()
      @image.setAttribute("src", src)

  recordOriginalDimensions: =>
    dimensions = Trix.DOM.getDimensions(@image)
    # @attachment.setAttributes(dimensions)

  resize: ({width, height} = {}) ->
    width ?= @attachment.attributes.width
    height ?= @attachment.attributes.height
    @image.width = width if width?
    @image.height = height if height?

  getDataURL = (file, callback) ->
    reader = new FileReader
    reader.onload = (event) -> callback(event.target.result)
    reader.readAsDataURL(file)
