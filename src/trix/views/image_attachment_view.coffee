#= require trix/views/attachment_view
#= require trix/models/image_attachment

{defer, makeElement, measureElement} = Trix

class Trix.ImageAttachmentView extends Trix.AttachmentView
  getPreloadOperation: ->
    if @attachment.preloadOperation?.hasSucceeded()
      @attachment.preloadOperation
    else if @attachment.previewPreloadOperation?
      @attachment.previewPreloadOperation
    else
      @attachment.preloadOperation

  createContentNodes: ->
    image = makeElement("img", src: "", "data-trix-mutable": true)
    @refresh(image)

    if operation = @attachment.preloadOperation
      operation.then =>
        @refresh(image)
        @refresh()

    [image]

  getClassName: ->
    [super, "image"].join(" ")

  refresh: (image) ->
    image ?= @findElement()?.querySelector("img")
    @updateAttributesForImage(image) if image

  updateAttributesForImage: (image) ->
    attachmentURL = @attachment.getURL()
    operation = @getPreloadOperation()
    image.src = url = operation.url

    if url is attachmentURL
      image.removeAttribute("data-trix-serialized-attributes")
    else
      serializedAttributes = JSON.stringify(src: attachmentURL)
      image.setAttribute("data-trix-serialized-attributes", serializedAttributes)

    if @attachmentPiece.getWidth()?
      image.width = @attachmentPiece.getWidth()
      image.height = @attachmentPiece.getHeight()
    else
      operation.then (result) ->
        image.width = result.width
        image.height = result.height
