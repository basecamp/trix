#= require trix/utilities/dom
#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

class Trix.BlockView
  constructor: (@block, @blockIndex) ->
    @text = @block.text
    @blockConfig = @getBlockConfig()
    @elements = []
    @nodeCache = []

  # Rendering

  render: ->
    container = document.createElement(@blockConfig.tagName ? "div")
    container.trixPosition = 0
    container.trixIndex = @blockIndex

    if @block.isEmpty()
      br = @createBRElementForPosition(0)
      container.appendChild(br)
    else
      @createElementsForText()
      @createExtraNewlineElement()
      container.appendChild(element) for element in @elements

    container

  getBlockConfig: ->
    return config for key of @block.getAttributes() when (config = Trix.attributes[key])?.block
    {}

  # Hold a reference to every node we create to prevent IE from losing
  # their expando properties like trixPosition. IE will otherwise occasionally
  # replace the nodes or remove the properties (uncertain which one).
  cacheNode: (nodes...) ->
    @nodeCache.push(node) for node in nodes

  createElementsForText: ->
    @text.eachRun (run) =>
      @previousRun = @currentRun
      @currentRun = run
      @createElementForCurrentRun()

  createElementForCurrentRun: ->
    {attributes, position, piece} = @currentRun
    return if attributes.blockBreak

    parentAttribute = @getParentAttribute()
    elements = createElementsForAttributes(attributes, parentAttribute)

    element = innerElement = elements[0]
    element.trixPosition = position
    element.trixIndex = @blockIndex
    @cacheNode(element)

    for child in elements[1..]
      @cacheNode(child)
      innerElement.appendChild(child)
      innerElement = child
      innerElement.trixPosition = position
      innerElement.trixIndex = @blockIndex

    if @currentRun.attachment
      attachmentElement = @createAttachmentElementForCurrentRun()
      @cacheNode(attachmentElement)

      if element.nodeType is Node.DOCUMENT_FRAGMENT_NODE
        element = attachmentElement
      else
        innerElement.appendChild(attachmentElement)

      element.setAttribute("contenteditable", "false")
      element.setAttribute("data-trix-serialize", "false") if piece.isPending()

      container = document.createDocumentFragment()
      container.appendChild(@createCursorTargetForPosition(position))
      container.appendChild(element)
      container.appendChild(@createCursorTargetForPosition(position + 1))
      element = container

    else if @currentRun.string
      for node in @createStringNodesForCurrentRun()
        @cacheNode(node)
        innerElement.appendChild(node)

    if parentAttribute
      @elements[@elements.length - 1].appendChild(element)
    else
      @elements.push(element)

  createCursorTargetForPosition: (position) ->
    text = document.createTextNode(Trix.ZERO_WIDTH_SPACE)
    text.trixCursorTarget = true
    text.trixPosition = position
    text.trixLength = 0
    text.trixIndex = @blockIndex
    span = document.createElement("span")
    span.setAttribute("data-trix-serialize", "false")
    span.trixCursorTarget = true
    span.trixPosition = position
    span.trixIndex = @blockIndex
    span.appendChild(text)
    @cacheNode(span)
    span

  getParentAttribute: ->
    if @previousRun
      for key, value of @currentRun.attributes when Trix.attributes[key]?.parent
        return key if value is @previousRun.attributes[key]

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  createExtraNewlineElement: ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        br = @createBRElementForPosition(string.length - 1)
        @elements.push(br)

  createAttachmentElementForCurrentRun: ->
    {attachment, attributes, position, piece} = @currentRun

    piece.element ?= (
      view = createAttachmentViewForAttachment(piece)
      element = view.render()
      element
    )

  createAttachmentViewForAttachment = (piece) ->
    if piece.isImage()
      new Trix.ImageAttachmentView piece
    else
      new Trix.FileAttachmentView piece

  createStringNodesForCurrentRun: ->
    {string, position} = @currentRun
    nodes = []

    if @blockConfig.plaintext
      node = document.createTextNode(string)
      node.trixPosition = position
      node.trixIndex = @blockIndex
      node.trixLength = string.length
      nodes.push(node)
    else
      for substring, index in string.split("\n")
        if index > 0
          node = @createBRElementForPosition(position)
          position++
          nodes.push(node)

        if length = substring.length
          node = document.createTextNode(preserveSpaces(substring))
          node.trixPosition = position
          node.trixIndex = @blockIndex
          position += length
          node.trixLength = length
          nodes.push(node)

    nodes

  createBRElementForPosition: (position) ->
    element = document.createElement("br")
    element.trixPosition = position
    element.trixLength = 1
    element.trixIndex = @blockIndex
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
