class Trix.ImageAttachmentView
  constructor: (@attachment) ->
    @attachment.delegate = this
    @image = document.createElement("img")

  render: ->
    @loadPreview() if @attachment.isPending()
    @updateImageAttributes()
    @image

  loadPreview: ->
    reader = new FileReader
    reader.onload = (event) =>
      @image.setAttribute("src", event.target.result)
    reader.readAsDataURL(@attachment.file)

  attributeNames = "src width height class".split(" ")

  updateImageAttributes: ->
    attributes = {}
    attributes[key] = value for key, value of @attachment.attributes
    attributes.src = attributes.url
    attributes.class = "pending-attachment" if @attachment.isPending()

    for key in attributeNames
      if value = attributes[key]
        @image.setAttribute(key, value)
      else
        @image.removeAttribute(key)

  # Attachment delegate

  attachmentDidUpdate: (@attachment) ->
    @updateImageAttributes()
