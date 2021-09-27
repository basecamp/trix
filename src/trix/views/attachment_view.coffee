import Trix from "trix/global"
import config from "trix/config"
import ObjectView from "trix/views/object_view"

{css} = config

export default class AttachmentView extends ObjectView
  @attachmentSelector: "[data-trix-attachment]"

  constructor: ->
    super(arguments...)
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createContentNodes: ->
    []

  createNodes: ->
    figure = innerElement = Trix.makeElement
      tagName: "figure"
      className: @getClassName()
      data: @getData()
      editable: false

    if href = @getHref()
      innerElement = Trix.makeElement(tagName: "a", editable: false, attributes: {href, tabindex: -1})
      figure.appendChild(innerElement)

    if @attachment.hasContent()
      innerElement.innerHTML = @attachment.getContent()
    else
      innerElement.appendChild(node) for node in @createContentNodes()

    innerElement.appendChild(@createCaptionElement())

    if @attachment.isPending()
      @progressElement = Trix.makeElement
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
    figcaption = Trix.makeElement(tagName: "figcaption", className: css.attachmentCaption)

    if caption = @attachmentPiece.getCaption()
      figcaption.classList.add("#{css.attachmentCaption}--edited")
      figcaption.textContent = caption
    else
      captionConfig = @getCaptionConfig()
      name = @attachment.getFilename() if captionConfig.name
      size = @attachment.getFormattedFilesize() if captionConfig.size

      if name
        nameElement = Trix.makeElement(tagName: "span", className: css.attachmentName, textContent: name)
        figcaption.appendChild(nameElement)

      if size
        figcaption.appendChild(document.createTextNode(" ")) if name
        sizeElement = Trix.makeElement(tagName: "span", className: css.attachmentSize, textContent: size)
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
    captionConfig = Trix.copyObject(config.attachments[type]?.caption)
    captionConfig.name = true if type is "file"
    captionConfig

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  createCursorTarget = (name) ->
    Trix.makeElement
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
  div = Trix.makeElement("div")
  div.innerHTML = html ? ""
  div.querySelector(tagName)
