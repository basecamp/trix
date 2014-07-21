class Trix.AttachmentView
  constructor: (@attachment) ->

  render: ->
    @element = document.createElement("figure")
    @element.setAttribute("contenteditable", false)
    @element.classList.add("attachment")

    @extension = document.createElement("div")
    @extension.classList.add("extension")
    @extension.textContent = @attachment.getExtension()

    @caption = document.createElement("figcaption")

    @updateAttributes()

    @element.appendChild(@extension)
    @element.appendChild(@caption)

    @element

  updateAttributes: ->
    @extension.textContent = @attachment.getExtension()
    @caption.textContent = @attachment.attributes.filename
    @caption.setAttribute("title", @attachment.attributes.filename)

  resize: ({width, height} = {}) ->
    @element.style.width = "#{width}px" if width?
    @element.style.height = "#{height}px" if height?

  # Attachment delegate

  attachmentDidChange: ->
    @updateAttributes()
