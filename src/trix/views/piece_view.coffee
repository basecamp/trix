#= require trix/views/file_attachment_view
#= require trix/views/image_attachment_view

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
      [@createAttachmentElement()]
    else
      @createStringNodes()

    if element = @createElement()
      findDeepestFirstChildOfElement(element).appendChild(node) for node in nodes
      nodes = [element]
    nodes

  createAttachmentElement: ->
    if @attachment.isImage()
      @createChildView(Trix.ImageAttachmentView, @piece.attachment, {@piece}).getElement()
    else
      @createChildView(Trix.FileAttachmentView, @piece.attachment, {@piece}).getElement()

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

  createElement: ->
    for key, value of @attributes when config = Trix.textAttributes[key]
      if config.tagName
        configElement = document.createElement(config.tagName)

        if element
          findDeepestFirstChildOfElement(element).appendChild(configElement)
        else
          element = configElement

      if config.style
        if styles
          styles[key] = val for key, value of config.style
        else
          styles = config.style

    if styles
      element ?= document.createElement("span")
      element.style[key] = value for key, value of styles
    element

  createGroupElement: ->
    for key, value of @attributes when config = Trix.textAttributes[key]
      if config.groupTagName
        element = document.createElement(config.groupTagName)
        element.setAttribute(key, value)
        return element

  findDeepestFirstChildOfElement = (element) ->
    element = element.firstChild while element.firstChild
    element
