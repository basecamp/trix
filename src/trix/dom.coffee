class Trix.DOM
  constructor: (@element) ->
    @element.setAttribute("contenteditable", "true")

  render: (text) ->
    selectedRange = @getSelectedRange()
    @nodes = []
    @positions = []

    @element.innerHTML = ""
    for container in @createContainersForText(text)
      @element.appendChild(container)
      for node in container.childNodes
        @nodes.push(node)
        @positions.push(node.trixPosition)

    @setSelectedRange(selectedRange)

  createContainersForText: (text) ->
    containers = []
    length = 0

    text.eachRun (string, attributes, position) ->
      container = createContainer(string, attributes, position)
      containers.push(container)
      length += string.length

    container = createContainer("\uFEFF", {}, length)
    containers.push(container)
    containers

  getSelectedRange: ->
    range = window.getSelection().getRangeAt(0)

    if isWithin(@element, range.startContainer) and isWithin(@element, range.endContainer)
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
      if container is @element and container.childNodes.length is 0
        offset
      else
        container.childNodes[offset].trixPosition

  findContainerAndOffsetForPosition: (position) ->
    index = 0
    for currentPosition, currentIndex in @positions
      break if position < currentPosition
      index = currentIndex

    node = @nodes[index]

    if node.nodeType is Node.TEXT_NODE
      [node, position - node.trixPosition]
    else
      offset = (index for child, index in node.parentNode.childNodes when child is node)
      [node.parentNode, offset]

  createContainer = (string, attributes, position) ->
    element = document.createElement("span")
    element.style["font-weight"] = "bold" if attributes.bold
    element.style["font-style"] = "italic" if attributes.italic
    element.style["text-decoration"] = "underline" if attributes.underline

    for substring, index in string.split("\n")
      if index > 0
        node = document.createElement("br")
        node.trixPosition = position
        position += 1
        element.appendChild(node)

      node = document.createTextNode(substring)
      node.trixPosition = position
      position += substring.length
      element.appendChild(node)

    element

  isWithin = (ancestor, element) ->
    while element
      return true if element is ancestor
      element = element.parentNode
    false
