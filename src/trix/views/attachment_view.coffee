{makeElement} = Trix
{css} = Trix.config

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
    figure = innerElement = makeElement
      tagName: "figure"
      className: @getClassName()
      data: @getData()
      editable: false

    if href = @getHref()
      innerElement = makeElement(tagName: "a", editable: false, attributes: {href, tabindex: -1})
      figure.appendChild(innerElement)

    if @attachment.hasContent()
      innerElement.innerHTML = @attachment.getContent()
    else
      innerElement.appendChild(node) for node in @createContentNodes()

    innerElement.appendChild(@createCaptionElement())

    if @attachment.isPending()
      @progressElement = makeElement
        tagName: "progress"
        attributes:
          class: css.attachmentProgress
          value: @attachment.getUploadProgress()
          max: 100
        data:
          trixMutable: true
          trixStoreKey: ["progressElement", @attachment.id].join("/")

      figure.appendChild(@progressElement)

    [createCursorTarget("left"), figure, createCursorTarget("right")]

  createCaptionElement: ->
    figcaption = makeElement(tagName: "figcaption", className: css.attachmentCaption)

    if caption = @attachmentPiece.getCaption()
      figcaption.classList.add("#{css.attachmentCaption}--edited")
      figcaption.textContent = caption
    else
      config = @getCaptionConfig()
      name = @attachment.getFilename() if config.name
      size = @attachment.getFormattedFilesize() if config.size

      if name
        nameElement = makeElement(tagName: "span", className: css.attachmentName, textContent: name)
        figcaption.appendChild(nameElement)

      if size
        figcaption.appendChild(document.createTextNode(" ")) if name
        sizeElement = makeElement(tagName: "span", className: css.attachmentSize, textContent: size)
        figcaption.appendChild(sizeElement)

    figcaption

  getClassName: ->
    names = [css.attachment, "#{css.attachment}--#{@attachment.getType()}"]
    if extension = @attachment.getExtension()
      names.push("#{css.attachment}--#{extension}")
    names.join(" ")

  getData: ->
    data =
      trixAttachment: JSON.stringify(@attachment)
      trixContentType: @attachment.getContentType()
      trixId: @attachment.id

    {attributes} = @attachmentPiece
    unless attributes.isEmpty()
      data.trixAttributes = JSON.stringify(attributes)

    if @attachment.isPending()
      data.trixSerialize = false

    data

  getHref: ->
    unless htmlContainsTagName(@attachment.getContent(), "a")
      @attachment.getHref()

  getCaptionConfig: ->
    type = @attachment.getType()
    config = Trix.copyObject(Trix.config.attachments[type]?.caption)
    config.name = true if type is "file"
    config

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  createCursorTarget = (name) ->
    makeElement
      tagName: "span"
      textContent: Trix.ZERO_WIDTH_SPACE
      data:
        trixCursorTarget: name
        trixSerialize: false

  # Attachment delegate

  attachmentDidChangeUploadProgress: ->
    value = @attachment.getUploadProgress()
    @findProgressElement()?.value = value

htmlContainsTagName = (html, tagName) ->
  div = makeElement("div")
  div.innerHTML = html ? ""
  div.querySelector(tagName)
