class Trix.TextView
  constructor: (@element, @text) ->
    @element.setAttribute("contenteditable", "true")
    @element.setAttribute("autocorrect", "off")
    @element.setAttribute("spellcheck", "false")
    @element.trixPosition = 0
    document.execCommand("enableObjectResizing", false, "false")

  focus: ->
    @element.focus()

  # Rendering

  render: ->
    selectedRange = @getSelectedRange()
    @element.innerHTML = ""
    @element.appendChild(element) for element in @createElementsForText()
    @setSelectedRange(selectedRange)

  createElementsForText: ->
    elements = []
    previousAttributes = {}

    @text.eachRun (run) ->
      parent = null
      element =
        if run.attachment
          createElementForAttachment(run)
        else
          createElement(run)

      if href = run.attributes.href
        if href is previousAttributes.href
          parent = elements[elements.length - 1]
        else
          link = createElement(tagName: "a", attributes: {href}, position: run.position)
          link.appendChild(element)
          element = link

      if parent
        parent.appendChild(element)
      else
        elements.push(element)

      previousAttributes = run.attributes

    # Add an extra newline if the text ends with one. Otherwise, the cursor won't move down.
    if @text.endsWith("\n")
      node = createNodesForString("\n", @text.getLength())[0]
      elements.push(node)

    elements

  createElement = ({string, attributes, position, tagName}) ->
    element = document.createElement(tagName ? "span")
    element.trixPosition = position

    if attributes
      if attributes.href and tagName is "a"
        element.setAttribute("href", attributes.href)

      element.style["font-weight"] = "bold" if attributes.bold
      element.style["font-style"] = "italic" if attributes.italic
      element.style["text-decoration"] = "underline" if attributes.underline
      element.style["background-color"] = "highlight" if attributes.selected

    if string
      for node in createNodesForString(string, position)
        element.appendChild(node)

    element

  createElementForAttachment = ({attachment, attributes, position}) ->
    switch attachment.type
      when "image"
        element = document.createElement("img")
        element.trixPosition = position
        element.setAttribute(key, value) for key, value of attachment when key isnt "type"
        element.style[key] = attributes[key] + "px" for key in ["width", "height"] when attributes[key]?
        element

  createNodesForString = (string, position) ->
    nodes = []

    for substring, index in string.split("\n")
      if index > 0
        node = document.createElement("br")
        node.trixPosition = position
        position += 1
        nodes.push(node)

      if substring.length
        node = document.createTextNode(preserveSpaces(substring))
        node.trixPosition = position
        position += substring.length
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

  # Selection

  getSelectedRange: ->
    return @lockedRange if @lockedRange

    selection = window.getSelection()
    return unless selection.rangeCount > 0

    range = selection.getRangeAt(0)

    if range.collapsed
      if isWithin(@element, range.endContainer)
        position = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [position, position]
    else
      if isWithin(@element, range.startContainer) and isWithin(@element, range.endContainer)
        startPosition = @findPositionFromContainerAtOffset(range.startContainer, range.startOffset)
        endPosition = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [startPosition, endPosition]

  setSelectedRange: ([startPosition, endPosition]) ->
    return if @lockedRange
    return unless startPosition? and endPosition?

    rangeStart = @findContainerAndOffsetForPosition(startPosition)
    rangeEnd =
      if startPosition is endPosition
        rangeStart
      else
        @findContainerAndOffsetForPosition(endPosition)

    range = document.createRange()
    try
      range.setStart(rangeStart...)
      range.setEnd(rangeEnd...)
    catch err
      range.setStart(@element, 0)
      range.setEnd(@element, 0)

    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

  lockSelection: ->
    @lockedRange = @getSelectedRange()

  unlockSelection: ->
    if lockedRange = @lockedRange
      delete @lockedRange
      lockedRange

  findPositionFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      container.trixPosition + offset
    else
      if container.hasChildNodes()
        if container.childNodes.length is offset
          container.lastChild.trixPosition + 1
        else
          container.childNodes[offset].trixPosition
      else
        container.trixPosition

  findContainerAndOffsetForPosition: (position) ->
    return [@element, 0] if position < 1

    walker = createTreeWalker(@element)
    node = walker.currentNode

    while walker.nextNode()
      break if walker.currentNode.trixPosition > position
      node = walker.currentNode

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = position - node.trixPosition
    else
      container = node.parentNode
      offset =
        if node.nextSibling
          [node.parentNode.childNodes...].indexOf(node)
        else
          node.parentNode.childNodes.length

    [container, offset]

  isWithin = (ancestor, element) ->
    while element
      return true if element is ancestor
      element = element.parentNode
    false

  createTreeWalker = (element) ->
    whatToShow = NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT

    acceptNode = (node) ->
      if node.trixPosition?
        NodeFilter.FILTER_ACCEPT
      else
        NodeFilter.FILTER_SKIP

    document.createTreeWalker(element, whatToShow, {acceptNode})
