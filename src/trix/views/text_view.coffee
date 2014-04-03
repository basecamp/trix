#= require trix/dom

class Trix.TextView
  constructor: (@element, @text) ->
    @element.trixPosition = 0

  focus: ->
    @element.focus()

  # Rendering

  render: ->
    selectedRange = @getSelectedRange()
    elements = @createElementsForText()
    @element.removeChild(@element.lastChild) while @element.lastChild
    @element.appendChild(element) for element in elements
    @setSelectedRange(selectedRange) if selectedRange

  createElementsForText: ->
    elements = []
    previousRun = null

    @text.eachRun (run) ->
      if href = run.attributes.href
        if href is previousRun?.attributes.href
          parent = elements[elements.length - 1]

      element =
        if run.attachment
          createElementForAttachment(run)
        else
          createElement(run, parent)

      if parent
        parent.appendChild(element)
      else
        elements.push(element)

      previousRun = run

    # Add an extra newline if the text ends with one. Otherwise, the cursor won't move down.
    if /\n$/.test(previousRun?.string)
      node = createNodesForString("\n", @text.getLength())[0]
      elements.push(node)

    elements

  createElement = ({string, attributes, position}, parent) ->
    {bold, italic, href, underline, frozen} = attributes
    elements = []

    if href and parent?.tagName.toLowerCase() isnt "a"
      a = document.createElement("a")
      a.setAttribute("href", href)
      elements.push(a)

    if bold
      elements.push(document.createElement("strong"))

    if italic
      elements.push(document.createElement("em"))

    if elements.length is 0
      if underline or frozen
        elements.push(document.createElement("span"))
      else
        elements.push(document.createDocumentFragment())

    outerElement = innerElement = elements[0]
    outerElement.style["text-decoration"] = "underline" if underline
    outerElement.style["background-color"] = "highlight" if frozen
    outerElement.trixPosition = position

    if elements.length > 1
      for element in elements.slice(1)
        innerElement.appendChild(element)
        innerElement = element
        innerElement.trixPosition = position

    if string
      for node in createNodesForString(string, position)
        innerElement.appendChild(node)

    outerElement

  createElementForAttachment = ({attachment, attributes, position}) ->
    switch attachment.type
      when "image"
        element = document.createElement("img")
        element.trixPosition = position
        element.trixLength = 1
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
        node.trixLength = 1
        nodes.push(node)

      if length = substring.length
        node = document.createTextNode(preserveSpaces(substring))
        node.trixPosition = position
        position += length
        node.trixLength = length
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

  # Position & Selection

  getPositionAtPoint: ([pageX, pageY]) ->
    if document.caretPositionFromPoint
      {offsetNode, offset} = document.caretPositionFromPoint(pageX, pageY)
      domRange = document.createRange()
      domRange.setStart(offsetNode, offset)

    else if document.caretRangeFromPoint
      domRange = document.caretRangeFromPoint(pageX, pageY)

    if domRange
      if range = @findRangeFromDOMRange(domRange)
        range[0]

  getSelectedRange: ->
    return @lockedRange if @lockedRange

    selection = window.getSelection()
    return unless selection.rangeCount > 0

    domRange = selection.getRangeAt(0)
    @findRangeFromDOMRange(domRange)

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

  # Private

  findRangeFromDOMRange: (range) ->
    if range.collapsed
      if Trix.DOM.within(@element, range.endContainer)
        position = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [position, position]
    else
      if Trix.DOM.within(@element, range.startContainer) and Trix.DOM.within(@element, range.endContainer)
        startPosition = @findPositionFromContainerAtOffset(range.startContainer, range.startOffset)
        endPosition = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
        [startPosition, endPosition]

  findPositionFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      container.trixPosition + offset
    else
      if offset is 0
        container.trixPosition
      else
        node = container.childNodes[offset - 1]
        walker = createTreeWalker(node)
        walker.lastChild()
        walker.currentNode.trixPosition + walker.currentNode.trixLength

  findContainerAndOffsetForPosition: (position) ->
    return [@element, 0] if position < 1

    node = @findNodeForPosition(position)

    if node.nodeType is Node.TEXT_NODE
      container = node
      offset = position - node.trixPosition
    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + 1

    [container, offset]

  findNodeForPosition: (position) ->
    walker = createTreeWalker(@element)
    node = walker.currentNode

    while walker.nextNode()
      startPosition = walker.currentNode.trixPosition
      endPosition = startPosition + walker.currentNode.trixLength

      if startPosition <= position <= endPosition
        node = walker.currentNode
        break
    node

  createTreeWalker = (element) ->
    whatToShow = NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT

    acceptNode = (node) ->
      if node.trixPosition? and node.trixLength?
        NodeFilter.FILTER_ACCEPT
      else
        NodeFilter.FILTER_SKIP

    document.createTreeWalker(element, whatToShow, {acceptNode})
