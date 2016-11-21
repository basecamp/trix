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

  # HTML parsing

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

  sanitizeHTML = (html) ->
    # Remove everything after </html>
    html = html.replace(/<\/html[^>]*>[^]*$/i, "</html>")

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
          if elementIsRemovable(node)
            nodesToRemove.push(node)
          else
            for {name} in [node.attributes...]
              unless name in allowedAttributes or name.indexOf("data-trix") is 0
                node.removeAttribute(name)
        when Node.COMMENT_NODE
          nodesToRemove.push(node)

    for node in nodesToRemove
      node.parentNode.removeChild(node)

    body.innerHTML

  elementIsRemovable = (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if nodeIsAttachmentElement(element)
    tagName(element) is "script" or element.getAttribute("data-trix-serialize") is "false"

  nodeFilter = (node) ->
    if tagName(node) is "style"
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

  processNode: (node) ->
    switch node.nodeType
      when Node.TEXT_NODE
        @processTextNode(node)
      when Node.ELEMENT_NODE
        @appendBlockForElement(node)
        @processElement(node)

  appendBlockForElement: (element) ->
    elementIsBlockElement = @isBlockElement(element)
    currentBlockContainsElement = elementContainsNode(@currentBlockElement, element)

    if elementIsBlockElement and not @isBlockElement(element.firstChild)
      unless @isInsignificantTextNode(element.firstChild) and @isBlockElement(element.firstElementChild)
        attributes = @getBlockAttributes(element)
        unless currentBlockContainsElement and arraysAreEqual(attributes, @currentBlock.attributes)
          @currentBlock = @appendBlockForAttributesWithElement(attributes, element)
          @currentBlockElement = element

    else if @currentBlockElement and not currentBlockContainsElement and not elementIsBlockElement
      if parentBlockElement = @findParentBlockElement(element)
        @appendBlockForElement(parentBlockElement)
      else
        @currentBlock = @appendEmptyBlock()
        @currentBlockElement = null

  findParentBlockElement: (element) ->
    {parentElement} = element
    while parentElement and parentElement isnt @containerElement
      if @isBlockElement(parentElement) and parentElement in @blockElements
        return parentElement
      else
        {parentElement} = parentElement
    null

  processTextNode: (node) ->
    unless @isInsignificantTextNode(node)
      string = node.data
      unless elementCanDisplayPreformattedText(node.parentNode)
        string = squishBreakableWhitespace(string)
        if stringEndsWithWhitespace(node.previousSibling?.textContent)
          string = leftTrimBreakableWhitespace(string)
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
          unless @isExtraBR(element) or @isBlockElement(element.nextSibling)
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

  # Document construction

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

  pieceForString = (string, attributes = {}) ->
    type = "string"
    string = normalizeSpaces(string)
    {string, attributes, type}

  pieceForAttachment = (attachment, attributes = {}) ->
    type = "attachment"
    {attachment, attributes, type}

  blockForAttributes = (attributes = {}) ->
    text = []
    {text, attributes}

  # Attribute parsing

  getTextAttributes: (element) ->
    attributes = {}
    for attribute, config of Trix.config.textAttributes
      if config.tagName and findClosestElementFromNode(element, matchingSelector: config.tagName, untilNode: @containerElement)
        attributes[attribute] = true
      else if config.parser
        if value = config.parser(element)
          attributeInheritedFromBlock = false
          for blockElement in @findBlockElementAncestors(element)
            if config.parser(blockElement) is value
              attributeInheritedFromBlock = true
              break
          unless attributeInheritedFromBlock
            attributes[attribute] = value

    if nodeIsAttachmentElement(element)
      if json = element.getAttribute("data-trix-attributes")
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

  getAttachmentAttributes = (element) ->
    JSON.parse(element.getAttribute("data-trix-attachment"))

  getImageDimensions = (element) ->
    width = element.getAttribute("width")
    height = element.getAttribute("height")
    dimensions = {}
    dimensions.width = parseInt(width, 10) if width
    dimensions.height = parseInt(height, 10) if height
    dimensions

  # Element inspection

  isBlockElement: (element) ->
    return unless element?.nodeType is Node.ELEMENT_NODE
    return if findClosestElementFromNode(element, matchingSelector: "td", untilNode: @containerElement)
    tagName(element) in getBlockTagNames() or window.getComputedStyle(element).display is "block"

  isInsignificantTextNode: (node) ->
    return unless node?.nodeType is Node.TEXT_NODE
    return unless stringIsAllBreakableWhitespace(node.data)
    return if elementCanDisplayPreformattedText(node.parentNode)
    not node.previousSibling or @isBlockElement(node.previousSibling) or not node.nextSibling or @isBlockElement(node.nextSibling)

  isExtraBR: (element) ->
    tagName(element) is "br" and
      @isBlockElement(element.parentNode) and
      element.parentNode.lastChild is element

  elementCanDisplayPreformattedText = (element) ->
    {whiteSpace} = window.getComputedStyle(element)
    whiteSpace in ["pre", "pre-wrap", "pre-line"]

  # Margin translation

  translateBlockElementMarginsToNewlines: ->
    defaultMargin = @getMarginOfDefaultBlockElement()

    for block, index in @blocks when margin = @getMarginOfBlockElementAtIndex(index)
      if margin.top > defaultMargin.top * 2
        @prependStringToTextAtIndex("\n", index)

      if margin.bottom > defaultMargin.bottom * 2
        @appendStringToTextAtIndex("\n", index)

  getMarginOfBlockElementAtIndex: (index) ->
    if element = @blockElements[index]
      unless tagName(element) in getBlockTagNames() or element in @processedElements
        getBlockElementMargin(element)

  getMarginOfDefaultBlockElement: ->
    element = makeElement(Trix.config.blockAttributes.default.tagName)
    @containerElement.appendChild(element)
    getBlockElementMargin(element)

  getBlockElementMargin = (element) ->
    style = window.getComputedStyle(element)
    if style.display is "block"
      top: parseInt(style.marginTop), bottom: parseInt(style.marginBottom)

  # Whitespace

  breakableWhitespacePattern = ///[^\S#{Trix.NON_BREAKING_SPACE}]///

  squishBreakableWhitespace = (string) ->
    string
      # Replace all breakable whitespace characters with a space
      .replace(///#{breakableWhitespacePattern.source}///g, " ")
      # Replace two or more spaces with a single space
      .replace(/\ {2,}/g, " ")

  leftTrimBreakableWhitespace = (string) ->
    string.replace(///^#{breakableWhitespacePattern.source}+///, "")

  stringIsAllBreakableWhitespace = (string) ->
    ///^#{breakableWhitespacePattern.source}*$///.test(string)

  stringEndsWithWhitespace = (string) ->
    /\s$/.test(string)
