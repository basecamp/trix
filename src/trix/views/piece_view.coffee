#= require trix/views/object_view
#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.PieceView extends Trix.ObjectView
  constructor: ->
    super
    @piece = @object
    {@position, @textConfig} = @options
    @cacheKey = "#{@cacheKey}@#{@position}"

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
      nodes.push(@recordNodeWithLocation(node, offset: @string.length))
    else
      position = @position
      for substring, index in @string.split("\n")
        if index > 0
          node = @createBRElementForPosition(position)
          position++
          nodes.push(node)

        if length = substring.length
          node = document.createTextNode(preserveSpaces(substring))
          nodes.push(@recordNodeWithLocation(node, offset: position))
          position += length
    nodes

  createBRElementForPosition: (position) ->
    element = document.createElement("br")
    @recordNodeWithLocation(element, offset: position)

  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")
