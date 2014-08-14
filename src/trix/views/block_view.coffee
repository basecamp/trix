#= require trix/utilities/dom
#= require trix/views/attachment_view
#= require trix/views/image_attachment_view

class Trix.BlockView
  constructor: (@block, @blockIndex) ->
    @text = @block.text
    @blockAttributes = @block.getAttributes()
    @elements = []
    @nodeCache = []

  # Rendering

  render: ->
    container = switch
      when @blockAttributes.quote
        document.createElement("blockquote")
      else
        document.createElement("div")

    container.trixPosition = 0
    container.trixIndex = @blockIndex

    if @block.isEmpty()
      br = document.createElement("br")
      br.trixPosition = 0
      br.trixLength = 1
      br.trixIndex = @blockIndex
      container.appendChild(br)
    else
      @createElementsForText()
      @createExtraNewlineElement()
      container.appendChild(element) for element in @elements

    container

  # Hold a reference to every node we create to prevent IE from losing
  # their expando properties like trixPosition. IE will otherwise occasionally
  # replace the nodes or remove the properties (uncertain which one).
  cacheNode: (node) ->
    @nodeCache.push(node)

  createElementsForText: ->
    @text.eachRun (run) =>
      @previousRun = @currentRun
      @currentRun = run
      @createElementForCurrentRun()

  createElementForCurrentRun: ->
    {attributes, position} = @currentRun
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
      if attachmentElement = @createAttachmentElementForCurrentRun()
        @cacheNode(attachmentElement)
        innerElement.appendChild(attachmentElement)
    else if @currentRun.string
      for node in @createStringNodesForCurrentRun()
        @cacheNode(node)
        innerElement.appendChild(node)

    if parentAttribute
      @elements[@elements.length - 1].appendChild(element)
    else
      @elements.push(element)

  getParentAttribute: ->
    if @previousRun
      for key, value of @currentRun.attributes when Trix.attributes[key]?.parent
        return key if value is @previousRun.attributes[key]

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  createExtraNewlineElement: ->
    if string = @currentRun?.string
      if /\n$/.test(string)
        @currentRun = { string: "\n", position: @text.getLength() }
        node = @createStringNodesForCurrentRun()[0]
        @cacheNode(node)
        @elements.push(node)

  createAttachmentElementForCurrentRun: ->
    {attachment, attributes, position, piece} = @currentRun

    view = createAttachmentViewForAttachment(piece)
    element = view.render()

    element.trixPosition = position
    element.trixLength = 1
    element.trixIndex = @blockIndex
    element.trixAttachmentId = attachment.id
    element

  createAttachmentViewForAttachment = (piece) ->
    if piece.isImage()
      new Trix.ImageAttachmentView piece
    else
      new Trix.AttachmentView piece

  createStringNodesForCurrentRun: ->
    {string, position} = @currentRun
    nodes = []

    for substring, index in string.split("\n")
      if index > 0
        node = document.createElement("br")
        node.trixPosition = position
        node.trixIndex = @blockIndex
        position += 1
        node.trixLength = 1
        nodes.push(node)

      if length = substring.length
        node = document.createTextNode(preserveSpaces(substring))
        node.trixPosition = position
        node.trixIndex = @blockIndex
        position += length
        node.trixLength = length
        nodes.push(node)

    nodes

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
