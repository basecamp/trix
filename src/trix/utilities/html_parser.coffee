{decapitalize} = Trix.Helpers
{findClosestElementFromNode, walkTree, tagName} = Trix.DOM

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
      walker = walkTree(@container)
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
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @appendBlockForElement(node)
        @processElement(node)

  appendBlockForElement: (element) ->
    unless @currentBlockElement?.contains(element)
      attributes = getBlockAttributes(element)
      if Object.keys(attributes).length or tagName(element) is "div"
        @appendBlockForAttributes(attributes)
        @currentBlockElement = element

  processTextNode: (node) ->
    unless node.textContent is Trix.ZERO_WIDTH_SPACE
      @appendStringWithAttributes(node.textContent, getTextAttributes(node.parentNode))

  processElement: (element) ->
    switch tagName(element)
      when "br"
        unless isExtraBR(element)
          @appendStringWithAttributes("\n", getTextAttributes(element))
      when "figure"
        if element.classList.contains("attachment")
          attributes = getAttachmentAttributes(element)
          if Object.keys(attributes).length
            textAttributes = getTextAttributes(node)
            if image = element.querySelector("img")
              textAttributes.width = image.width if image.width?
              textAttributes.height = image.height if image.height?
            @appendAttachmentForAttributes(attributes, textAttributes)
            # We have everything we need so avoid processing inner nodes
            element.innerHTML = ""
      when "img"
        attributes = url: element.src, contentType: "image"
        textAttributes = getTextAttributes(element)
        textAttributes.width = element.width if element.width?
        textAttributes.height = element.height if element.height?
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

  getTextAttributes = (element) ->
    attributes = {}
    for attribute, config of Trix.textAttributes
      if config.parser
        if value = config.parser(element)
          attributes[attribute] = value
      else if config.tagName
        if tagName(element) is config.tagName
          attributes[attribute] = true
    attributes

  getBlockAttributes = (element) ->
    attributes = {}
    for attribute, config of Trix.blockAttributes
      if tagName(element) is config.tagName
        if config.test?(element) or not config.test
          attributes[attribute] = true
          break
    attributes

  getAttachmentAttributes = (element) ->
    attributes = {}
    for key, value of element.dataset
      attributeName = decapitalize(key.replace(/^trix/, ''))
      attributes[attributeName] = value
    attributes

  sanitizeHTML = (html) ->
    {body} = new DOMParser().parseFromString(html, "text/html")
    walker = walkTree(body, onlyNodesOfType: "element")
    while walker.nextNode()
      element = walker.currentNode
      for {name} in [element.attributes...]
        unless name in allowedAttributes or name.indexOf("data-trix") is 0
          element.removeAttribute(name)
    body.innerHTML

  isExtraBR = (element) ->
    previousSibling = element.previousElementSibling
    tagName(element) is "br" and
      (not previousSibling? or tagName(element) is tagName(previousSibling)) and
      element is element.parentNode.lastChild and
      window.getComputedStyle(element.parentNode).display is "block"
