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
    [super, "attachment--image", "attachment--preview"].join(" ")

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

    width = @attachment.getWidth()
    height = @attachment.getHeight()

    image.width = width if width?
    image.height = height if height?
