#= require trix/utilities/helpers

{capitalize} = Trix.Helpers

class Trix.AttachmentView
  constructor: (@attachmentPiece) ->
    {@attachment} = @attachmentPiece

  render: ->
    element = document.createElement("figure")
    element.classList.add("attachment")
    element.trixAttachmentId = @attachment.id

    for key, value of @attachmentPiece.getMetadata()
      element.dataset["trix#{capitalize(key)}"] = value

    if @attachmentPiece.isPending()
      progress = document.createElement("progress")
      progress.setAttribute("id", "trix-progress-#{@attachment.id}")
      progress.setAttribute("max", 100)
      progress.setAttribute("value", 0)
      element.appendChild(progress)

    element
