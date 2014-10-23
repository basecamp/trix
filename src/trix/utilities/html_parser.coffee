#= require trix/models/document

{decapitalize} = Trix.Helpers

class Trix.HTMLParser
  allowedAttributes = "style href src width height class".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html, {@attachments} = {}) ->
    @blocks = []

  createHiddenContainer: ->
    @container = sanitizeHTML(@html)
    @container.style["display"] = "none"
    document.body.appendChild(@container)

  removeHiddenContainer: ->
    document.body.removeChild(@container)

  parse: ->
    @createHiddenContainer()
    walker = Trix.DOM.createTreeWalker(@container)
    @processNode(walker.currentNode) while walker.nextNode()
    @removeHiddenContainer()

  processNode: (node) ->
    @appendBlockForNode(node)
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @processElementNode(node)

  appendBlockForNode: (node) ->
    unless @currentBlockElement?.contains(node)
      if node.nodeType is Node.ELEMENT_NODE
        if window.getComputedStyle(node).display is "block"
          switch node.tagName.toLowerCase()
            when "blockquote"
              @appendBlockForAttributes(quote: true)
              @currentBlockElement = node
            when "pre"
              @appendBlockForAttributes(code: true)
              @currentBlockElement = node
            when "div"
              @appendBlockForAttributes()
              @currentBlockElement = node

    unless @blocks.length
      @appendBlockForAttributes({})

  processTextNode: (node) ->
    unless node.textContent is Trix.ZERO_WIDTH_SPACE
      string = node.textContent.replace(/\s/, " ")
      @appendStringWithAttributes(string, getAttributes(node.parentNode))

  processElementNode: (node) ->
    switch node.tagName.toLowerCase()
      when "br"
        unless nodeIsExtraBR(node)
          @appendStringWithAttributes("\n", getAttributes(node))
      when "figure"
        if node.classList.contains("attachment")
          attributes = getMetadata(node)
          textAttributes = getAttributes(node)
          if image = node.querySelector("img")
            textAttributes.width = image.width if image.width?
            textAttributes.height = image.height if image.height?
          @appendAttachmentForAttributes(attributes, textAttributes)
          # We have everything we need so avoid processing inner nodes
          node.innerHTML = ""

  appendBlockForAttributes: (attributes) ->
    @text = new Trix.Text
    block = new Trix.Block @text, attributes
    @blocks.push(block)

  appendStringWithAttributes: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @appendText(@text.appendText(text))

  appendAttachmentForAttributes: (attributes, textAttributes) ->
    attachment = if @attachments and attributes.id
      @attachments.get(attributes.id)
    else
      delete attributes.id
      new Trix.Attachment attributes

    text = Trix.Text.textForAttachmentWithAttributes(attachment, textAttributes)
    @appendText(@text.appendText(text))

  appendText: (@text) ->
    index = @blocks.length - 1
    block = @blocks[index]
    @blocks[index] = block.copyWithText(@text)

  getDocument: ->
    new Trix.Document @blocks

  getAttributes = (element) ->
    attributes = {}
    style = window.getComputedStyle(element)

    for attribute, config of Trix.attributes
      unless config.block
        if config.parser
          if value = config.parser({element, style})
            attributes[attribute] = value
        else if config.tagName
          if element.tagName?.toLowerCase() is config.tagName
            attributes[attribute] = true
    attributes

  getMetadata = (element) ->
    attributes = {}
    for key, value of element.dataset
      attributeName = decapitalize(key.replace(/^trix/, ''))
      attributes[attributeName] = value
    attributes

  sanitizeHTML = (html) ->
    container = document.createElement("div")
    container.innerHTML = html
    walker = Trix.DOM.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)

    while walker.nextNode()
      element = walker.currentNode
      for attribute in [element.attributes...]
        do (attribute) ->
          {name} = attribute
          element.removeAttribute(name) unless name in allowedAttributes or name.indexOf("data-trix") is 0

    container

  nodeIsExtraBR = (node) ->
    node.tagName.toLowerCase() is "br" and
      node.tagName is node.previousElementSibling?.tagName and
      node is node.parentNode.lastChild and
      window.getComputedStyle(node.parentNode).display is "block"
