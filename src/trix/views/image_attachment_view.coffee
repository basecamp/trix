#= require trix/views/attachment_view
#= require trix/models/image_attachment

{defer} = Trix.Helpers
{makeElement, measureElement} = Trix.DOM

class Trix.ImageAttachmentView extends Trix.AttachmentView
  getPreloadOperation: ->
    if @attachment.preloadOperation?.hasSucceeded()
      @attachment.preloadOperation
    else if @attachment.previewPreloadOperation?
      @attachment.previewPreloadOperation
    else
      @attachment.preloadOperation

  createNodes: ->
    element = @createElement()
    element.classList.add("image")

    image = makeElement("img")
    element.appendChild(image)
    @refresh(element)

    if operation = @attachment.preloadOperation
      operation.then =>
        @refresh(element)
        @refresh()

    [element]

  refresh: (element = @findElement()) ->
    if image = element?.querySelector("img")
      @updateAttributesForImage(image)

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
