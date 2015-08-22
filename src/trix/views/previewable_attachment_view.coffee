#= require trix/views/attachment_view

{defer, makeElement, measureElement} = Trix

class Trix.PreviewableAttachmentView extends Trix.AttachmentView
  constructor: ->
    super
    @attachment.previewDelegate = this

  createContentNodes: ->
    @image = makeElement
      tagName: "img"
      attributes:
        src: ""
      data:
        trixMutable: true
        trixStoreKey: @attachment.getCacheKey("imageElement")

    @refresh(@image)
    [@image]

  refresh: (image) ->
    image ?= @findElement()?.querySelector("img")
    @updateAttributesForImage(image) if image

  updateAttributesForImage: (image) ->
    url = @attachment.getURL()
    preloadedURL = @attachment.getPreloadedURL()
    image.src = preloadedURL or url

    if preloadedURL is url
      image.removeAttribute("data-trix-serialized-attributes")
    else
      serializedAttributes = JSON.stringify(src: url)
      image.setAttribute("data-trix-serialized-attributes", serializedAttributes)

    width = @attachment.getWidth()
    height = @attachment.getHeight()

    image.width = width if width?
    image.height = height if height?

  # Attachment delegate

  attachmentDidPreload: ->
    @refresh(@image)
    @refresh()
