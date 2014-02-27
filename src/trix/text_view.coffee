class Trix.TextView
  constructor: (@element, @text) ->
    @element.setAttribute("contenteditable", "true")
    @element.setAttribute("autocorrect", "off")
    @element.setAttribute("spellcheck", "false")

  focus: ->
    @element.focus()

  render: ->
    selectedRange = @getSelectedRange()
    @element.innerHTML = ""
    @element.appendChild(container) for container in @createContainersForText()
    @recordNodePositions()
    @appendBRelement()
    @setSelectedRange(selectedRange)

  createContainersForText: ->
    containers = []
    previousAttributes = {}

    @text.eachRun (string, attributes, position) ->
      parent = null
      container = createContainer(string, attributes, position)

      if attributes.href
        if attributes.href is previousAttributes.href
          parent = containers[containers.length - 1]
        else
          link = createContainer("", { href: attributes.href }, position, "a")
          link.appendChild(container)
          container = link

      if parent
        parent.appendChild(container)
      else
        containers.push(container)

      previousAttributes = attributes
    containers

  recordNodePositions: ->
    @nodes = []
    @positions = []
    walker = document.createTreeWalker(@element)
    while walker.nextNode()
      if node = walker.currentNode
        if node.trixPosition?
          @recordNode(node)

  recordNode: (node) ->
    @nodes.push(node)
    @positions.push(node.trixPosition)
    node

  # Add an extra BR if the last node is one. Without the extra, the cursor won't move down.
  appendBRelement: ->
    if node = @nodes[@nodes.length - 1]
      if node.tagName?.toLowerCase() is "br"
        br = node.cloneNode(false)
        br.trixPosition = node.trixPosition + 1
        @element.appendChild(@recordNode(br))

  getSelectedRange: ->
    selection = window.getSelection()
    return unless selection.rangeCount > 0

    range = selection.getRangeAt(0)
    return unless isWithin(@element, range.startContainer) and isWithin(@element, range.endContainer)

    startPosition = @findPositionFromContainerAtOffset(range.startContainer, range.startOffset)
    endPosition = @findPositionFromContainerAtOffset(range.endContainer, range.endOffset)
    [startPosition, endPosition]

  setSelectedRange: ([startPosition, endPosition]) ->
    return unless startPosition? and endPosition?

    range = document.createRange()
    [startContainer, startOffset] = @findContainerAndOffsetForPosition(startPosition)
    [endContainer, endOffset] = @findContainerAndOffsetForPosition(endPosition)

    try
      range.setStart(startContainer, startOffset)
      range.setEnd(endContainer, endOffset)
    catch err
      range.setStart(@element, 0)
      range.setEnd(@element, 0)

    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

  findPositionFromContainerAtOffset: (container, offset) ->
    if container.nodeType is Node.TEXT_NODE
      container.trixPosition + offset
    else
      container.childNodes[offset]?.trixPosition ? offset

  findContainerAndOffsetForPosition: (position) ->
    if @nodes.length is 0
      [@element, 0]
    else
      index = 0
      for currentPosition, currentIndex in @positions
        break if position < currentPosition
        index = currentIndex

      node = @nodes[index]

      if node.nodeType is Node.TEXT_NODE
        [node, position - node.trixPosition]
      else
        offset = [node.parentNode.childNodes...].indexOf(node)
        [node.parentNode, offset]

  createContainer = (string, attributes, position, tagName = "span") ->
    element = document.createElement(tagName)

    if attributes.href and tagName is "a"
      element.setAttribute("href", attributes.href)

    element.style["font-weight"] = "bold" if attributes.bold
    element.style["font-style"] = "italic" if attributes.italic
    element.style["text-decoration"] = "underline" if attributes.underline

    for substring, index in string.split("\n")
      if index > 0
        node = document.createElement("br")
        node.trixPosition = position
        position += 1
        element.appendChild(node)

      if substring.length
        node = document.createTextNode(preserveSpaces(substring))
        node.trixPosition = position
        position += substring.length
        element.appendChild(node)

    element

  preserveSpaces = (string) ->
    string
      # Replace two spaces with a space and a non-breaking space
      .replace(/\s{2}/g, " \u00a0")
      # Replace leading space with a non-breaking space
      .replace(/^\s{1}/, "\u00a0")
      # Replace trailing space with a non-breaking space
      .replace(/\s{1}$/, "\u00a0")

  isWithin = (ancestor, element) ->
    while element
      return true if element is ancestor
      element = element.parentNode
    false
