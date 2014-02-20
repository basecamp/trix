class RichText.DOM
  constructor: (@element) ->

  render: (text) ->
    selectedRange = @getSelectedRange()
    @containers = []
    @positions = []

    @element.innerHTML = ""
    for container in @createContainersForText(text)
      @element.appendChild(container)
      @containers.push(container)
      @positions.push(container.trixPosition)

    @setSelectedRange(selectedRange)

  createContainersForText: (text) ->
    containers = []
    length = 0

    text.eachRun (string, attributes, position) ->
      containers.push createContainer(string, attributes, position)
      length += string.length

    containers.push createContainer("\uFEFF", {}, length)
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

  findPositionFromContainerAtOffset: (container, offset, textOffset) ->
    return 0 unless container

    if (position = container?.trixPosition)?
      return position + textOffset

    if container.nodeType is Node.TEXT_NODE
      @findPositionFromContainerAtOffset container.parentNode, null, offset
    else
      @findPositionFromContainerAtOffset container.childNodes[offset], null, 0

  findContainerAndOffsetForPosition: (position) ->
    index = 0
    for currentPosition, currentIndex in @positions
      break if position < currentPosition
      index = currentIndex

    container = @containers[index]
    [container.childNodes[0], position - container.trixPosition]

  createContainer = (string, attributes, position) ->
    element = document.createElement("span")
    textNode = document.createTextNode(string)
    element.appendChild(textNode)

    element.style["font-weight"] = "bold" if attributes.bold
    element.style["font-style"] = "italic" if attributes.italic
    element.style["text-decoration"] = "underline" if attributes.underline

    element.trixPosition = position
    element

  isWithin = (ancestor, element) ->
    while element
      return true if element is ancestor
      element = element.parentNode
    false
