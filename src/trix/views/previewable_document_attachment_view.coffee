#= require trix/views/attachment_view

{defer, makeElement, measureElement} = Trix

class Trix.PreviewableDocumentAttachmentView extends Trix.AttachmentView
  constructor: ->
    super
    @attachment.previewDelegate = this

  createContentNodes: ->
    @document = makeElement
      tagName: "div"
      data:
        trixMutable: true
        trixStoreKey: @attachment.getCacheKey("documentElement")

    @refresh(@document)
    [@document]

  refresh: (doc) ->
    doc ?= @findElement()?.querySelector("div")
    @updateAttributesForDocument(doc) if doc

  updateAttributesForDocument: (doc) ->
    url = @attachment.getURL()

    serializedAttributes = JSON.stringify(src: url)
    doc.setAttribute("data-trix-serialized-attributes", serializedAttributes)

  # Attachment delegate

  attachmentDidPreload: ->
    @refresh(@document)
    @refresh()
