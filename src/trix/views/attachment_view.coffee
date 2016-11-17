{makeElement, selectionElements} = Trix
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

    [selectionElements.create("cursorTarget"), element, selectionElements.create("cursorTarget")]

  createCaptionElement: ->
    figcaption = makeElement(tagName: "figcaption", className: classNames.attachment.caption)

    if caption = @attachmentPiece.getCaption()
      figcaption.classList.add(classNames.attachment.captionEdited)
      figcaption.textContent = caption
    else
      if filename = @attachment.getFilename()
        figcaption.textContent = filename

        if filesize = @attachment.getFormattedFilesize()
          figcaption.appendChild(document.createTextNode(" "))
          span = makeElement(tagName: "span", className: classNames.attachment.size, textContent: filesize)
          figcaption.appendChild(span)

    figcaption

  getClassName: ->
    names = [classNames.attachment.container, "#{classNames.attachment.typePrefix}#{@attachment.getType()}"]
    if extension = @attachment.getExtension()
      names.push(extension)
    names.join(" ")

  getHref: ->
    unless htmlContainsTagName(@attachment.getContent(), "a")
      @attachment.getHref()

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
