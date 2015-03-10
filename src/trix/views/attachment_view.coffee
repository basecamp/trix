{makeElement} = Trix

class Trix.AttachmentView extends Trix.ObjectView
  @attachmentSelector: "[data-trix-attachment]"

  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createNodes: ->
    figure = makeElement({tagName: "figure", className: @getClassName()})
    figcaption = makeElement(tagName: "figcaption")

    if caption = @attachmentPiece.getCaption()
      figcaption.textContent = caption
    else
      if filename = @attachment.getFilename()
        figcaption.textContent = filename

        if filesize = @attachment.getFormattedFilesize()
          span = makeElement(tagName: "span", className: "size", textContent: filesize)
          figcaption.appendChild(span)

    figure.appendChild(node) for node in @createContentNodes()
    figure.appendChild(figcaption)

    data =
      trixAttachment: JSON.stringify(@attachment)
      trixId: @attachment.id

    attributes = @attachmentPiece.getAttributesForAttachment()
    unless attributes.isEmpty()
      data.trixAttributes = JSON.stringify(attributes)

    if @attachment.isPending()
      data.trixSerialize = false
      progressElement = makeElement("progress", max: 100, value: 0, "data-trix-mutable": true)
      figure.appendChild(progressElement)

    if href = @attachment.getHref()
      element = makeElement("a", {href})
      element.appendChild(figure)
    else
      element = figure

    element.dataset[key] = value for key, value of data
    element.setAttribute("contenteditable", false)

    [@createCursorTarget(), element, @createCursorTarget()]

  getClassName: ->
    "attachment"

  createCursorTarget: ->
    makeElement
      tagName: "span"
      textContent: Trix.ZERO_WIDTH_SPACE
      data:
        trixCursorTarget: true
        trixSerialize: false

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  # Attachment delegate

  attachmentDidChangeUploadProgress: ->
    if element = @findProgressElement()
      element.value = @attachment.getUploadProgress()
