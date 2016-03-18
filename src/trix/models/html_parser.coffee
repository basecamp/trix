{arraysAreEqual, normalizeSpaces, makeElement, tagName, getBlockTagNames, walkTree,
 findClosestElementFromNode, elementContainsNode, nodeIsAttachmentElement} = Trix

class Trix.HTMLParser extends Trix.BasicObject
  allowedAttributes = "style href src width height class".split(" ")

  @parse: (html, options) ->
    parser = new this html, options
    parser.parse()
    parser

  constructor: (@html, {@referenceElement} = {}) ->
    @blocks = []
    @blockElements = []
    @processedElements = []

  getDocument: ->
    Trix.Document.fromJSON(@blocks)

  parse: ->
    try
      @createHiddenContainer()
      html = sanitizeHTML(@html)
      @containerElement.innerHTML = html
      walker = walkTree(@containerElement, usingFilter: nodeFilter)
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
    if @referenceElement
      @containerElement = @referenceElement.cloneNode(false)
      @containerElement.removeAttribute("id")
      @containerElement.setAttribute("data-trix-internal", "")
      @containerElement.style.display = "none"
      @referenceElement.parentNode.insertBefore(@containerElement, @referenceElement.nextSibling)
    else
      @containerElement = makeElement(tagName: "div", style: { display: "none" })
      document.body.appendChild(@containerElement)

  removeHiddenContainer: ->
    @containerElement.parentNode.removeChild(@containerElement)

  processNode: (node) ->
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @appendBlockForElement(node)
        @processElement(node)

  appendBlockForElement: (element) ->
    if isBlockElement(element) and not isBlockElement(element.firstChild)
      attributes = @getBlockAttributes(element)
      unless elementContainsNode(@currentBlockElement, element) and arraysAreEqual(attributes, @currentBlock.attributes)
        @currentBlock = @appendBlockForAttributesWithElement(attributes, element)
        @currentBlockElement = element

    else if @currentBlockElement and not elementContainsNode(@currentBlockElement, element) and not isBlockElement(element)
      if parentBlockElement = @findParentBlockElement(element)
        @appendBlockForElement(parentBlockElement)
      else
        @currentBlock = @appendEmptyBlock()
        @currentBlockElement = null

  findParentBlockElement: (element) ->
    {parentElement} = element
    while parentElement and parentElement isnt @containerElement
      if isBlockElement(parentElement) and parentElement in @blockElements
        return parentElement
      else
        {parentElement} = parentElement
    null

  processTextNode: (node) ->
    if string = normalizeSpaces(node.data)
      unless elementCanDisplayNewlines(node.parentNode)
        string = convertNewlinesToSpaces(string)
      @appendStringWithAttributes(string, @getTextAttributes(node.parentNode))

  processElement: (element) ->
    if nodeIsAttachmentElement(element)
      attributes = getAttachmentAttributes(element)
      if Object.keys(attributes).length
        textAttributes = @getTextAttributes(element)
        @appendAttachmentWithAttributes(attributes, textAttributes)
        # We have everything we need so avoid processing inner nodes
        element.innerHTML = ""
      @processedElements.push(element)
    else
      switch tagName(element)
        when "br"
          unless isExtraBR(element) or isBlockElement(element.nextSibling)
            @appendStringWithAttributes("\n", @getTextAttributes(element))
          @processedElements.push(element)
        when "img"
          attributes = url: element.getAttribute("src"), contentType: "image"
          attributes[key] = value for key, value of getImageDimensions(element)
          @appendAttachmentWithAttributes(attributes, @getTextAttributes(element))
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

  getTextAttributes: (element) ->
    attributes = {}
    for attribute, config of Trix.config.textAttributes
      if config.tagName and findClosestElementFromNode(element, matchingSelector: config.tagName)
        attributes[attribute] = true
      else if config.parser
        if value = config.parser(element)
          attributeInheritedFromBlock = false
          for blockElement in @findBlockElementAncestors(element.firstChild)
            if config.parser(blockElement) is value
              attributeInheritedFromBlock = true
              break
          unless attributeInheritedFromBlock
            attributes[attribute] = value

    if nodeIsAttachmentElement(element)
      if json = element.dataset.trixAttributes
        for key, value of JSON.parse(json)
          attributes[key] = value

    attributes

  getBlockAttributes: (element) ->
    attributes = []
    while element and element isnt @containerElement
      for attribute, config of Trix.config.blockAttributes when config.parse isnt false
        if tagName(element) is config.tagName
          if config.test?(element) or not config.test
            attributes.push(attribute)
            attributes.push(config.listAttribute) if config.listAttribute
      element = element.parentNode
    attributes.reverse()

  findBlockElementAncestors: (element) ->
    ancestors = []
    while element and element isnt @containerElement
      if tagName(element) in getBlockTagNames()
        ancestors.push(element)
      element = element.parentNode
    ancestors

  getMarginOfBlockElementAtIndex: (index) ->
    if element = @blockElements[index]
      unless tagName(element) in getBlockTagNames() or element in @processedElements
        getBlockElementMargin(element)

  getMarginOfDefaultBlockElement: ->
    element = makeElement(Trix.config.blockAttributes.default.tagName)
    @containerElement.appendChild(element)
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

  getAttachmentAttributes = (element) ->
    JSON.parse(element.dataset.trixAttachment)

  sanitizeHTML = (html) ->
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
          if isInsignificantTextNode(node)
            nodesToRemove.push(node)

    for node in nodesToRemove
      node.parentNode.removeChild(node)

    body.innerHTML

  convertNewlinesToSpaces = (string) ->
    string.replace(/\s?\n\s?/g, " ")

  isBlockElement = (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if findClosestElementFromNode(element, matchingSelector: "td")
    tagName(element) in getBlockTagNames() or window.getComputedStyle(element).display is "block"

  isInsignificantTextNode = (node) ->
    return unless node?.nodeType is Node.TEXT_NODE
    return unless /^\s*$/.test(node.data)
    return if elementCanDisplayNewlines(node.parentNode)
    isBlockElement(node.previousSibling) and isBlockElement(node.nextSibling)

  isExtraBR = (element) ->
    tagName(element) is "br" and
      isBlockElement(element.parentNode) and
      element.parentNode.lastChild is element

  elementCanDisplayNewlines = (element) ->
    {whiteSpace} = window.getComputedStyle(element)
    whiteSpace in ["pre", "pre-wrap", "pre-line"]

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
