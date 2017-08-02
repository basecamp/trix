{makeElement} = Trix
{classNames} = Trix.config.css

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
          class: classNames.attachment.progressBar
          value: @attachment.getUploadProgress()
          max: 100
        data:
          trixMutable: true
          trixStoreKey: ["progressElement", @attachment.id].join("/")

      figure.appendChild(@progressElement)
      data.trixSerialize = false

    if href = @getHref()
      element = makeElement("a", {href})
      element.appendChild(figure)
    else
      element = figure

    element.dataset[key] = value for key, value of data
    element.setAttribute("contenteditable", false)

    [createCursorTarget("left"), element, createCursorTarget("right")]

  createCaptionElement: ->
    figcaption = makeElement(tagName: "figcaption", className: classNames.attachment.caption)

    if caption = @attachmentPiece.getCaption()
      figcaption.classList.add(classNames.attachment.captionEdited)
      figcaption.textContent = caption
    else
      config = @getCaptionConfig()
      name = @attachment.getFilename() if config.name
      size = @attachment.getFormattedFilesize() if config.size

      if name
        nameElement = makeElement(tagName: "span", className: classNames.attachment.name, textContent: name)
        figcaption.appendChild(nameElement)

      if size
        figcaption.appendChild(document.createTextNode(" ")) if name
        sizeElement = makeElement(tagName: "span", className: classNames.attachment.size, textContent: size)
        figcaption.appendChild(sizeElement)

    figcaption

  getClassName: ->
    names = [classNames.attachment.container, "#{classNames.attachment.typePrefix}#{@attachment.getType()}"]
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")

  getHref: ->
    unless htmlContainsTagName(@attachment.getContent(), "a")
      @attachment.getHref()

  getCaptionConfig: ->
    type = @attachment.getType()
    config = Trix.config.attachments[type]?.caption ? {}
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
