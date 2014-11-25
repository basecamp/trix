{capitalize} = Trix.Helpers
{makeElement} = Trix.DOM

class Trix.AttachmentView extends Trix.ObjectView
  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createElement: ->
    dataAttributes = @attachment.getAttributes()
    dataAttributes.id = @attachment.id
    dataAttributes.serialize = false if @attachment.isPending()
    data = {}
    data["trix#{capitalize(key)}"] = value for key, value of dataAttributes

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
