class Trix.ImageAttachmentView
  constructor: (@attachment) ->
    @attachment.delegate = this
    @image = document.createElement("img")

  render: ->
    @loadFile() if @attachment.isPending()
    @updateImageAttributes()
    @image

  loadFile: ->
    reader = new FileReader
    reader.onload = (event) =>
      if @attachment.isPending()
        @image.setAttribute("src", event.target.result)
        @attachment.setAttributes(width: @image.offsetWidth, height: @image.offsetHeight)
    reader.readAsDataURL(@attachment.file)

  attributeNames = "url width height class".split(" ")

  updateImageAttributes: ->
    attributes = {}

    for key in attributeNames
      attributes[key] = @attachment.attributes[key]

    if attributes.url
      attributes.src = attributes.url
      delete attributes.url

    if @attachment.isPending()
      attributes.class = "pending-attachment"

    for key, value of attributes
      if value?
        @image.setAttribute(key, value)
      else
        @image.removeAttribute(key)

  # Attachment delegate

  attachmentDidChange: ->
    @updateImageAttributes()
