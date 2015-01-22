{makeElement} = Trix.DOM

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
      progressElement = makeElement("progress", max: 100)
      figure.appendChild(progressElement)

    if href = @attachment.getHref()
      element = makeElement("a", {href})
      element.appendChild(figure)
    else
      element = figure

    element.dataset[key] = value for key, value of data
    element.setAttribute("contenteditable", false)
    [element]

  getClassName: ->
    "attachment"

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  # Attachment delegate

  attachmentDidChangeUploadProgress: ->
    @findProgressElement()?.setAttribute("value", @attachment.getUploadProgress())
