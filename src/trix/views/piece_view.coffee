#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.PieceView
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
    @element.dataset.trixPosition = @position

    for child in elements[1..]
      innerElement.appendChild(child)
      innerElement = child
      innerElement.dataset.trixPosition = @position

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
    span = document.createElement("span")
    span.textContent = Trix.ZERO_WIDTH_SPACE
    span.setAttribute("data-trix-serialize", "false")
    span.dataset.trixCursorTarget = true
    span.dataset.trixPosition = position
    span

  createAttachmentElement: ->
    @piece.element ?= (
      view = createAttachmentViewForAttachment(@piece)
      element = view.render()
      element
    )

  createAttachmentViewForAttachment = (piece) ->
    if piece.isImage()
      new Trix.ImageAttachmentView piece
    else
      new Trix.FileAttachmentView piece

  createStringNodes: ->
    nodes = []

    if @options.plaintext
      node = document.createElement("span")
      node.textContent = @string
      node.dataset.trixPosition = @position
      node.dataset.trixLength = @string.length
      node.dataset.trixSerializeContainer = false
      nodes.push(node)
    else
      for substring, index in @string.split("\n")
        if index > 0
          node = @createBRElementForPosition(@position)
          @position++
          nodes.push(node)

        if length = substring.length
          node = document.createElement("span")
          node.textContent = preserveSpaces(substring)
          @position += length
          node.dataset.trixPosition = @position
          node.dataset.trixLength = length
          node.dataset.trixSerializeContainer = false
          nodes.push(node)
    nodes

  createBRElementForPosition: (position) ->
    element = document.createElement("br")
    element.dataset.trixPosition = position
    element.dataset.trixLength = 1
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
      span = document.createElement("span")
      span.dataset.trixSerializeContainer = false
      elements.push(span)

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
