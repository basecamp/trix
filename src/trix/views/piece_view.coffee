#= require trix/views/view
#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.PieceView extends Trix.View
  constructor: (@piece, @position) ->
    @options = {}

    if @piece.attachment
      @attachment = @piece.attachment
    else
      @string = @piece.toString()

  render: ->
    if @attachment
      @element = @createAttachmentElement()
    else if @string
      @element = document.createDocumentFragment()
      for node in @createStringNodes()
        @element.appendChild(node)

    @element

  createAttachmentElement: ->
    view = if @piece.isImage()
      @createChildView(Trix.ImageAttachmentView, @piece)
    else
      @createChildView(Trix.FileAttachmentView, @piece)

    @piece.element ?= (
      element = view.render()
      element
    )

  createStringNodes: ->
    nodes = []

    if @options.plaintext
      node = document.createTextNode(@string)
      @recordNode(node, offset: @string.length)
      nodes.push(node)
    else
      position = @position
      for substring, index in @string.split("\n")
        if index > 0
          node = @createBRElementForPosition(position)
          position++
          nodes.push(node)

        if length = substring.length
          node = document.createTextNode(preserveSpaces(substring))
          @recordNode(node, offset: position)
          position += length
          nodes.push(node)
    nodes

  createBRElementForPosition: (position) ->
    element = document.createElement("br")
    @recordNode(element, offset: position)
    element

  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")
