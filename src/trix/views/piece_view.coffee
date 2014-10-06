#= require trix/views/object_view
#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.PieceView extends Trix.ObjectView
  constructor: ->
    super
    @piece = @object
    {@textConfig} = @options

    if @piece.attachment
      @attachment = @piece.attachment
    else
      @string = @piece.toString()

  createNodes: ->
    if @attachment
      [@createAttachmentElement()]
    else if @string
      @createStringNodes()

  createAttachmentElement: ->
    if @piece.isImage()
      @findOrCreateChildView(Trix.ImageAttachmentView, @piece.attachment, {@piece}).render()
    else
      @findOrCreateChildView(Trix.FileAttachmentView, @piece.attachment, {@piece}).render()

  createStringNodes: ->
    nodes = []

    if @textConfig.plaintext
      node = document.createTextNode(@string)
      nodes.push(node)
    else
      for substring, index in @string.split("\n")
        if index > 0
          element = document.createElement("br")
          nodes.push(element)

        if length = substring.length
          node = document.createTextNode(preserveSpaces(substring))
          nodes.push(node)
    nodes

  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")
