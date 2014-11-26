{makeElement} = Trix.DOM

class Trix.AttachmentView extends Trix.ObjectView
  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createElement: ->
    data =
      trixAttachment: JSON.stringify(@attachment)
      trixId: @attachment.id

    if @attachment.isPending()
      data.trixSerialize = false

    element = makeElement({tagName: "figure", className: "attachment", editable: false, data})

    if @attachment.isPending()
      progressElement = makeElement("progress", max: 100)
      element.appendChild(progressElement)
    element

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  # Attachment delegate

  attachmentDidChangeUploadProgress: ->
    @findProgressElement()?.setAttribute("value", @attachment.getUploadProgress())
