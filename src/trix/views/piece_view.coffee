#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

{makeElement, findInnerElement} = Trix.DOM

class Trix.PieceView extends Trix.ObjectView
  constructor: ->
    super
    @piece = @object
    @attributes = @piece.getAttributes()
    {@textConfig} = @options

    if @piece.attachment
      @attachment = @piece.attachment
    else
      @string = @piece.toString()

  createNodes: ->
    nodes = if @attachment
      @createAttachmentNodes()
    else
      @createStringNodes()

    if element = @createElement()
      innerElement = findInnerElement(element)
      innerElement.appendChild(node) for node in nodes
      nodes = [element]
    nodes

  createAttachmentNodes: ->
    viewType = if @attachment.isImage() then "Image" else "File"
    view = @createChildView(Trix["#{viewType}AttachmentView"], @piece.attachment, {@piece})
    view.getNodes()

  createStringNodes: ->
    if @textConfig.plaintext
      [document.createTextNode(@string)]
    else
      nodes = []
      for substring, index in @string.split("\n")
        if index > 0
          element = makeElement("br")
          nodes.push(element)

        if length = substring.length
          node = document.createTextNode(preserveSpaces(substring))
          nodes.push(node)
      nodes

  createElement: ->
    for key of @attributes when config = Trix.textAttributes[key]
      if config.tagName
        pendingElement = makeElement(config.tagName)

        if innerElement
          innerElement.appendChild(pendingElement)
          innerElement = pendingElement
        else
          element = innerElement = pendingElement

      if config.style
        if styles
          styles[key] = value for key, value of config.style
        else
          styles = config.style

    if styles
      element ?= makeElement("span")
      element.style[key] = value for key, value of styles
    element

  createGroupElement: ->
    for key, value of @attributes when config = Trix.textAttributes[key]
      if config.groupTagName
        attributes = {}
        attributes[key] = value
        return makeElement(config.groupTagName, attributes)


  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")
