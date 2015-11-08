{arraysAreEqual, normalizeSpaces, makeElement, tagName, walkTree,
 findClosestElementFromNode, elementContainsNode, nodeIsAttachmentElement} = Trix

class Trix.HTMLParser extends Trix.BasicObject
  allowedAttributes = "style href src width height class".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html) ->
    @blocks = []
    @blockElements = []
    @processedElements = []

  getDocument: ->
    Trix.Document.fromJSON(@blocks)

  parse: ->
    try
      @createHiddenContainer()
      html = sanitizeHTML(@html)
      @container.innerHTML = html
      walker = walkTree(@container, usingFilter: nodeFilter)
      @processNode(walker.currentNode) while walker.nextNode()
      @translateBlockElementMarginsToNewlines()
    finally
      @removeHiddenContainer()

  nodeFilter = (node) ->
    if tagName(node) is "style"
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

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
      unless elementContainsNode(@currentBlockElement, element) and arraysAreEqual(attributes, @currentBlock.attributes)
        @currentBlock = @appendBlockForAttributesWithElement(attributes, element)
        @currentBlockElement = element

    else if @currentBlockElement and not elementContainsNode(@currentBlockElement, element) and not @isBlockElement(element)
      if parentBlockElement = @findParentBlockElement(element)
        @appendBlockForElement(parentBlockElement)
      else
        @currentBlock = @appendEmptyBlock()
        @currentBlockElement = null

  findParentBlockElement: (element) ->
    {parentElement} = element
    while parentElement
      if @isBlockElement(parentElement) and parentElement in @blockElements
        return parentElement
      else
        {parentElement} = parentElement
    null

  isExtraBR: (element) ->
    tagName(element) is "br" and
      @isBlockElement(element.parentNode) and
      element.parentNode.lastChild is element

  isBlockElement: (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if findClosestElementFromNode(element, matchingSelector: "td")
    tagName(element) in @getBlockTagNames() or window.getComputedStyle(element).display is "block"

  getBlockTagNames: ->
    @blockTagNames ?= (value.tagName for key, value of Trix.config.blockAttributes)

  processTextNode: (node) ->
    if string = normalizeSpaces(node.data)
      @appendStringWithAttributes(string, getTextAttributes(node.parentNode))

  processElement: (element) ->
    if nodeIsAttachmentElement(element)
      attributes = getAttachmentAttributes(element)
      if Object.keys(attributes).length
        textAttributes = getTextAttributes(element)
        @appendAttachmentWithAttributes(attributes, textAttributes)
        # We have everything we need so avoid processing inner nodes
        element.innerHTML = ""
      @processedElements.push(element)
    else
      switch tagName(element)
        when "br"
          unless @isExtraBR(element) or @isBlockElement(element.nextElementSibling)
            @appendStringWithAttributes("\n", getTextAttributes(element))
          @processedElements.push(element)
        when "img"
          attributes = url: element.src, contentType: "image"
          attributes[key] = value for key, value of getImageDimensions(element)
          @appendAttachmentWithAttributes(attributes, getTextAttributes(element))
          @processedElements.push(element)
        when "tr"
          unless element.parentNode.firstChild is element
            @appendStringWithAttributes("\n")
        when "td"
          unless element.parentNode.firstChild is element
            @appendStringWithAttributes(" | ")

  appendBlockForAttributesWithElement: (attributes, element) ->
    @blockElements.push(element)
    block = blockForAttributes(attributes)
    @blocks.push(block)
    block

  appendEmptyBlock: ->
    @appendBlockForAttributesWithElement([], null)

  appendStringWithAttributes: (string, attributes) ->
    @appendPiece(pieceForString(string, attributes))

  appendAttachmentWithAttributes: (attachment, attributes) ->
    @appendPiece(pieceForAttachment(attachment, attributes))

  appendPiece: (piece) ->
    if @blocks.length is 0
      @appendEmptyBlock()
    @blocks[@blocks.length - 1].text.push(piece)

  appendStringToTextAtIndex: (string, index) ->
    {text} = @blocks[index]
    piece = text[text.length - 1]

    if piece?.type is "string"
      piece.string += string
    else
      text.push(pieceForString(string))

  prependStringToTextAtIndex: (string, index) ->
    {text} = @blocks[index]
    piece = text[0]

    if piece?.type is "string"
      piece.string = string + piece.string
    else
      text.unshift(pieceForString(string))

  getMarginOfBlockElementAtIndex: (index) ->
    if element = @blockElements[index]
      unless tagName(element) in @getBlockTagNames() or element in @processedElements
        getBlockElementMargin(element)

  getMarginOfDefaultBlockElement: ->
    element = makeElement(Trix.config.blockAttributes.default.tagName)
    @container.appendChild(element)
    getBlockElementMargin(element)

  translateBlockElementMarginsToNewlines: ->
    defaultMargin = @getMarginOfDefaultBlockElement()

    for block, index in @blocks when margin = @getMarginOfBlockElementAtIndex(index)
      if margin.top > defaultMargin.top * 2
        @prependStringToTextAtIndex("\n", index)

      if margin.bottom > defaultMargin.bottom * 2
        @appendStringToTextAtIndex("\n", index)

  pieceForString = (string, attributes = {}) ->
    type = "string"
    {string, attributes, type}

  pieceForAttachment = (attachment, attributes = {}) ->
    type = "attachment"
    {attachment, attributes, type}

  blockForAttributes = (attributes = {}) ->
    text = []
    {text, attributes}

  getTextAttributes = (element) ->
    attributes = {}
    for attribute, config of Trix.config.textAttributes
      if config.parser
        if value = config.parser(element)
          attributes[attribute] = value
      else if config.tagName
        if tagName(element) is config.tagName
          attributes[attribute] = true

    if nodeIsAttachmentElement(element)
      if json = element.dataset.trixAttributes
        for key, value of JSON.parse(json)
          attributes[key] = value

    attributes

  getBlockAttributes = (element) ->
    attributes = []
    while element
      for attribute, config of Trix.config.blockAttributes when config.parse isnt false
        if tagName(element) is config.tagName
          if config.test?(element) or not config.test
            attributes.push(attribute)
            attributes.push(config.listAttribute) if config.listAttribute
      element = element.parentNode
    attributes.reverse()

  getAttachmentAttributes = (element) ->
    JSON.parse(element.dataset.trixAttachment)

  sanitizeHTML = (html) ->
    html = removeInsignificantWhitespace(html)
    doc = document.implementation.createHTMLDocument("")
    doc.documentElement.innerHTML = html
    {body, head} = doc

    for style in head.querySelectorAll("style")
      body.appendChild(style)

    nodesToRemove = []
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
          nodesToRemove.push(node)
        when Node.TEXT_NODE
          if node.data.match(/^\s*$/) and node.parentNode is body
            nodesToRemove.push(node)

    for node in nodesToRemove
      node.parentNode.removeChild(node)

    body.innerHTML

  removeInsignificantWhitespace = (html) ->
    html
      .replace(/>\n+</g, "><")
      .replace(/>\ +</g, "> <")

  getBlockElementMargin = (element) ->
    style = window.getComputedStyle(element)
    if style.display is "block"
      top: parseInt(style.marginTop), bottom: parseInt(style.marginBottom)

  getImageDimensions = (element) ->
    width = element.getAttribute("width")
    height = element.getAttribute("height")
    dimensions = {}
    dimensions.width = parseInt(width, 10) if width
    dimensions.height = parseInt(height, 10) if height
    dimensions
