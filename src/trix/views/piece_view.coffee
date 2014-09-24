#= require trix/views/view
#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.PieceView extends Trix.View
  constructor: (@piece, @parentAttribute, @position) ->
    @options = {}
    @attributes = @piece.getAttributes()
    if @piece.attachment
      @attachment = @piece.attachment
    else
      @string = @piece.toString()

  render: ->
    elements = createElementsForAttributes(@attributes, @parentAttribute)

    @element = innerElement = elements[0]
    @recordNode(@element, offset: @position)

    for child in elements[1..]
      innerElement.appendChild(child)
      innerElement = child
      @recordNode(innerElement, offset: @position)

    if @attachment
      attachmentElement = @createAttachmentElement()

      if @element.nodeType is Node.DOCUMENT_FRAGMENT_NODE
        @element = attachmentElement
      else
        innerElement.appendChild(attachmentElement)

      @element.setAttribute("contenteditable", "false")
      @element.setAttribute("data-trix-serialize", "false") if @piece.isPending()

      container = document.createDocumentFragment()
      container.appendChild(@createCursorTargetForPosition(@position))
      container.appendChild(@element)
      container.appendChild(@createCursorTargetForPosition(@position + 1))
      @element = container

    else if @string
      for node in @createStringNodes()
        innerElement.appendChild(node)

    @element

  createCursorTargetForPosition: (position) ->
    text = document.createTextNode(Trix.ZERO_WIDTH_SPACE)
    @recordNode(text, offset: position)
    span = document.createElement("span")
    span.appendChild(text)
    span.dataset.trixSerialze = false
    span

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

  createElementsForAttributes = (attributes, parentAttribute) ->
    elements = []
    styles = []

    for key, value of attributes when config = Trix.attributes[key]
      if config.style
        styles.push(config.style)

      if config.tagName
        unless config.parent and key is parentAttribute
          element = document.createElement(config.tagName)
          element.setAttribute(key, value) unless typeof(value) is "boolean"

          if config.parent
            elements.unshift(element)
          else
            elements.push(element)

    unless elements.length
      if styles.length
        elements.push(document.createElement("span"))
      else
        elements.push(document.createDocumentFragment())

    for style in styles
      elements[0].style[key] = value for key, value of style

    elements

  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")
