#= require trix/views/attachment_view
#= require trix/views/previewable_attachment_view

{makeElement, findInnerElement} = Trix

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
    constructor = if @attachment.isPreviewable()
      Trix.PreviewableAttachmentView
    else
      Trix.AttachmentView

    view = @createChildView(constructor, @piece.attachment, {@piece})
    view.getNodes()

  createStringNodes: ->
    if @textConfig?.plaintext
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
    for key of @attributes when config = Trix.config.textAttributes[key]
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

  createContainerElement: ->
    for key, value of @attributes when config = Trix.config.textAttributes[key]
      if config.groupTagName
        attributes = {}
        attributes[key] = value
        return makeElement(config.groupTagName, attributes)

  preserveSpaces = (string) ->
    nbsp = Trix.NON_BREAKING_SPACE
    string
      .replace(/\ $/, nbsp)
      .replace(/(\S)\ {3}(\S)/g, "$1 #{nbsp} $2")
      .replace(/\ {2}/g, "#{nbsp} ")
      .replace(/\ {2}/g, " #{nbsp}")
      .replace(/^\ /, nbsp)
