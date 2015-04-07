{makeElement} = Trix

class Trix.AttachmentView extends Trix.ObjectView
  @attachmentSelector: "[data-trix-attachment]"

  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createContentNodes: ->
    []

  createNodes: ->
    figure = makeElement({tagName: "figure", className: @getClassName()})
    figcaption = makeElement(tagName: "figcaption", className: "attachment__caption")

    if caption = @attachmentPiece.getCaption()
      figcaption.classList.add("attachment__caption--edited")
      figcaption.textContent = caption
    else
      if filename = @attachment.getFilename()
        figcaption.textContent = filename

        if filesize = @attachment.getFormattedFilesize()
          span = makeElement(tagName: "span", className: "attachment__size", textContent: filesize)
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
      progressElement = makeElement(tagName: "progress", className: "attachment__progress", max: 100, value: 0, "data-trix-mutable": true)
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
    names = ["attachment"]
    if @attachment.isPreviewable()
      names.push("preview")
    else
      names.push("file")
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")

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
