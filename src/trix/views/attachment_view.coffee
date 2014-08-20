class Trix.AttachmentView
  constructor: (@attachmentPiece) ->
    {@attachment} = @attachmentPiece

  render: ->
    @element = document.createElement("figure")
    @element.setAttribute("contenteditable", false)
    @element.classList.add("attachment")

    @extension = document.createElement("div")
    @extension.classList.add("extension")
    @extension.textContent = @attachmentPiece.getExtension()

    @caption = document.createElement("figcaption")

    @updateAttributes()

    @element.appendChild(@extension)
    @element.appendChild(@caption)

    @element

  updateAttributes: ->
    @extension.textContent = @attachmentPiece.getExtension()
    @caption.textContent = @attachmentPiece.getFilename()
    @caption.setAttribute("title", @attachmentPiece.getFilename())

  resize: ({width, height} = {}) ->
    @element.style.width = "#{width}px" if width?
    @element.style.height = "#{height}px" if height?
