{makeElement} = Trix

class Trix.AttachmentView extends Trix.ObjectView
  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createNodes: ->
    figure = makeElement({tagName: "figure", className: @getClassName()})
    figure.appendChild(node) for node in @createContentNodes()

    data =
      trixAttachment: JSON.stringify(@attachment)
      trixId: @attachment.id

    if @attachment.isPending()
      data.trixSerialize = false
      progressElement = makeElement(tagName: "progress", max: 100, data: { trixMutable: true })
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
