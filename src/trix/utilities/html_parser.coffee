{decapitalize} = Trix.Helpers
{findClosestElementFromNode} = Trix.DOM

class Trix.HTMLParser
  allowedAttributes = "style href src width height class".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html, {@attachments} = {}) ->
    @blocks = []

  parse: ->
    try
      @createHiddenContainer()
      @container.innerHTML = sanitizeHTML(@html)
      walker = Trix.DOM.walkTree(@container)
      @processNode(walker.currentNode) while walker.nextNode()
    finally
      @removeHiddenContainer()

  createHiddenContainer: ->
    @container = document.createElement("div")
    @container.style["display"] = "none"
    document.body.appendChild(@container)

  removeHiddenContainer: ->
    document.body.removeChild(@container)

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
        switch node.tagName.toLowerCase()
          when "blockquote"
            @appendBlockForAttributes(quote: true)
            @currentBlockElement = node
          when "pre"
            @appendBlockForAttributes(code: true)
            @currentBlockElement = node
          when "li"
            if findClosestElementFromNode(node, matchingSelector: "ol")
              @appendBlockForAttributes(number: true)
              @currentBlockElement = node
            else if findClosestElementFromNode(node, matchingSelector: "ul")
              @appendBlockForAttributes(bullet: true)
              @currentBlockElement = node
          when "div"
            @appendBlockForAttributes()
            @currentBlockElement = node

  processTextNode: (node) ->
    unless node.textContent is Trix.ZERO_WIDTH_SPACE
      @appendStringWithAttributes(node.textContent, getAttributes(node.parentNode))

  processElementNode: (node) ->
    switch node.tagName.toLowerCase()
      when "br"
        unless nodeIsExtraBR(node)
          @appendStringWithAttributes("\n", getAttributes(node))
      when "figure"
        if node.classList.contains("attachment")
          attributes = getMetadata(node)
          if Object.keys(attributes).length
            textAttributes = getAttributes(node)
            if image = node.querySelector("img")
              textAttributes.width = image.width if image.width?
              textAttributes.height = image.height if image.height?
            @appendAttachmentForAttributes(attributes, textAttributes)
            # We have everything we need so avoid processing inner nodes
            node.innerHTML = ""
      when "img"
        attributes = url: node.src, contentType: "image"
        textAttributes = getAttributes(node)
        textAttributes.width = node.width if node.width?
        textAttributes.height = node.height if node.height?
        @appendAttachmentForAttributes(attributes, textAttributes)

  appendBlockForAttributes: (attributes) ->
    @text = new Trix.Text
    block = new Trix.Block @text, attributes
    @blocks.push(block)

  appendStringWithAttributes: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @appendText(text)

  appendAttachmentForAttributes: (attributes, textAttributes) ->
    attachment = if @attachments and attributes.id
      @attachments.get(attributes.id)
    else
      delete attributes.id
      new Trix.Attachment attributes

    text = Trix.Text.textForAttachmentWithAttributes(attachment, textAttributes)
    @appendText(text)

  appendText: (text) ->
    if @blocks.length is 0
      @appendBlockForAttributes({})

    @text = @text.appendText(text)
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
    walker = Trix.DOM.walkTree(container, onlyNodesOfType: "element")
    while walker.nextNode()
      element = walker.currentNode
      for attribute in [element.attributes...]
        do (attribute) ->
          {name} = attribute
          element.removeAttribute(name) unless name in allowedAttributes or name.indexOf("data-trix") is 0
    container.innerHTML

  nodeIsExtraBR = (node) ->
    previousSibling = node.previousElementSibling
    node.tagName.toLowerCase() is "br" and
      (not previousSibling? or node.tagName is previousSibling.tagName) and
      node is node.parentNode.lastChild and
      window.getComputedStyle(node.parentNode).display is "block"
