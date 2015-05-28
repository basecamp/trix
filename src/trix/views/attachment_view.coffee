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

    if @attachment.hasContent()
      figure.innerHTML = @attachment.getContent()
    else
      figure.appendChild(node) for node in @createContentNodes()

    figure.appendChild(@createCaptionElement())

    data =
      trixAttachment: JSON.stringify(@attachment)
      trixContentType: @attachment.getContentType()
      trixId: @attachment.id

    attributes = @attachmentPiece.getAttributesForAttachment()
    unless attributes.isEmpty()
      data.trixAttributes = JSON.stringify(attributes)

    if @attachment.isPending()
      @progressElement = makeElement
        tagName: "progress"
        attributes:
          className: "attachment__progress"
          value: @attachment.getUploadProgress()
          max: 100
        data:
          trixMutable: true
          trixStoreKey: @attachment.getCacheKey("progressElement")

      figure.appendChild(@progressElement)
      data.trixSerialize = false

    if href = @getHref()
      element = makeElement("a", {href})
      element.appendChild(figure)
    else
      element = figure

    element.dataset[key] = value for key, value of data
    element.setAttribute("contenteditable", false)

    [@createCursorTarget(), element, @createCursorTarget()]

  createCaptionElement: ->
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

    figcaption

  getClassName: ->
    names = ["attachment", "attachment--#{@attachment.getType()}"]
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")

  getHref: ->
    unless htmlContainsTagName(@attachment.getContent(), "a")
      @attachment.getHref()

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
    value = @attachment.getUploadProgress()
    @findProgressElement()?.value = value

htmlContainsTagName = (html, tagName) ->
  div = makeElement("div")
  div.innerHTML = html ? ""
  div.querySelector(tagName)
