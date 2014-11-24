#= require trix/views/object_view

{capitalize} = Trix.Helpers

class Trix.AttachmentView extends Trix.ObjectView
  constructor: ->
    super
    @attachment = @object
    @attachment.uploadProgressDelegate = this
    @attachmentPiece = @options.piece

  createElement: ->
    element = document.createElement("figure")
    element.classList.add("attachment")
    element.setAttribute("contenteditable", false)
    element.dataset.trixId = @attachment.id

    for key, value of @attachment.getAttributes()
      element.dataset["trix#{capitalize(key)}"] = value

    if @attachment.isPending()
      element.dataset.trixSerialize = false
      progressElement = document.createElement("progress")
      progressElement.setAttribute("max", 100)
      element.appendChild(progressElement)

    element

  findProgressElement: ->
    @findElement()?.querySelector("progress")

  # Attachment delegate

  attachmentDidChangeUploadProgress: ->
    @findProgressElement()?.setAttribute("value", @attachment.getUploadProgress())
