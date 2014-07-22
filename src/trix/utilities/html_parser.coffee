#= require trix/models/document
#= require trix/utilities/dom

class Trix.HTMLParser
  allowedAttributes = "style href src width height".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html, {@attachments} = {}) ->
    @blocks = []

  createHiddenContainer: ->
    @container = sanitizeHTML(squish(@html))
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
    if @currentBlockElement?
      unless Trix.DOM.within(@currentBlockElement, node)
        @appendBlock()
        delete @currentBlockElement

    if node.nodeType is Node.ELEMENT_NODE
      if window.getComputedStyle(node).display is "block"
        switch node.tagName.toLowerCase()
          when "blockquote"
            @appendBlock(quote: true)
            @currentBlockElement = node

    unless @block?
      @appendBlock()

  processTextNode: (node) ->
    string = node.textContent.replace(/\s/, " ")
    @appendString(string, getAttributes(node.parentNode))

  processElementNode: (node) ->
    switch node.tagName.toLowerCase()
      when "br"
        unless nodeIsExtraBR(node)
          @appendString("\n", getAttributes(node))
      when "img"
        attributes = { contentType: "image", url: node.getAttribute("src") }
        identifier = node.getAttribute("data-trix-identifier") if node.hasAttribute("data-trix-identifier")
        for key in ["width", "height"] when value = node.getAttribute(key)
          attributes[key] = value

        @appendAttachment(attributes, getAttributes(node), identifier)

  appendBlock: (attributes = {}) ->
    text = new Trix.Text
    @block = new Trix.Block text, attributes
    @blocks.push(@block)

  appendString: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @block.text = @block.text.appendText(text)

  appendAttachment: (attachmentAttributes, attributes, identifier) ->
    if attachment = @attachments?.findWhere(url: attachmentAttributes.url)
      if attachmentAttributes.width?
        attributes.width = attachmentAttributes.width
        attributes.height = attachmentAttributes.height
    else
      attachment = new Trix.Attachment attachmentAttributes
      attachment.setIdentifier(identifier) if identifier?

    text = Trix.Text.textForAttachmentWithAttributes(attachment, attributes)
    @block.text = @block.text.appendText(text)

  getDocument: ->
    new Trix.Document @blocks

  getAttributes = (element) ->
    attributes = {}
    style = window.getComputedStyle(element)

    for attribute, config of Trix.attributes when config.parser
      if value = config.parser({element, style})
        attributes[attribute] = value

    attributes

  squish = (string) ->
    string.trim().replace(/\n/g, " ").replace(/\s{2,}/g, " ")

  sanitizeHTML = (html) ->
    container = document.createElement("div")
    container.innerHTML = html
    walker = Trix.DOM.createTreeWalker(container, NodeFilter.SHOW_ELEMENT)

    while walker.nextNode()
      element = walker.currentNode
      for attribute in [element.attributes...]
        do (attribute) ->
          {name} = attribute
          element.removeAttribute(name) unless name in allowedAttributes

    container

  nodeIsExtraBR = (node) ->
    node.tagName.toLowerCase() is "br" and
      node.tagName is node.previousElementSibling?.tagName and
      node is node.parentNode.lastElementChild and
      window.getComputedStyle(node.parentNode).display is "block"
