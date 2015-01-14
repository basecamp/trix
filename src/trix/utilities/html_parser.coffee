{findClosestElementFromNode, walkTree, tagName, makeElement, elementContainsNode} = Trix.DOM
{arraysAreEqual} = Trix.Helpers

class Trix.HTMLParser
  allowedAttributes = "style href src width height class".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html) ->
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
    @container = makeElement(tagName: "div", style: { display: "none" })
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
    if @isBlockElement(element) and not @isBlockElement(element.firstChild)
      attributes = getBlockAttributes(element)
      unless elementContainsNode(@currentBlockElement, element) and arraysAreEqual(attributes, @currentBlock.getAttributes())
        @currentBlock = @appendBlockForAttributes(attributes)
        @currentBlockElement = element

  isBlockElement: (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    tagName(element) in @getBlockTagNames() or window.getComputedStyle(element).display is "block"

  getBlockTagNames: ->
    @blockTagNames ?= (value.tagName for key, value of Trix.blockAttributes)

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
            textAttributes = getTextAttributes(element)
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
    block

  appendStringWithAttributes: (string, attributes) ->
    text = Trix.Text.textForStringWithAttributes(string, attributes)
    @appendText(text)

  appendAttachmentForAttributes: (attributes, textAttributes) ->
    attachment = new Trix.Attachment attributes
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
    attributes = []
    while element
      for attribute, config of Trix.blockAttributes when config.parse isnt false
        if tagName(element) is config.tagName
          if config.test?(element) or not config.test
            attributes.push(attribute)
            attributes.push(config.parentAttribute) if config.parentAttribute
      element = element.parentNode
    attributes.reverse()

  getAttachmentAttributes = (element) ->
    JSON.parse(element.dataset.trixAttachment)

  sanitizeHTML = (html) ->
    {body} = document.implementation.createHTMLDocument("")
    body.innerHTML = html

    commentNodes = []
    walker = walkTree(body)

    while walker.nextNode()
      node = walker.currentNode
      switch node.nodeType
        when Node.ELEMENT_NODE
          element = node
          for {name} in [element.attributes...]
            unless name in allowedAttributes or name.indexOf("data-trix") is 0
              element.removeAttribute(name)
        when Node.COMMENT_NODE
          commentNodes.push(node)

    for node in commentNodes
      node.parentNode.removeChild(node)

    body.innerHTML

  isExtraBR = (element) ->
    previousSibling = element.previousElementSibling
    tagName(element) is "br" and
      (not previousSibling? or tagName(element) is tagName(previousSibling)) and
      element is element.parentNode.lastChild and
      window.getComputedStyle(element.parentNode).display is "block"
