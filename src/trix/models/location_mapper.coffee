{findClosestElementFromNode, findNodeFromContainerAndOffset,
 nodeIsBlockStartComment, nodeIsCursorTarget, nodeIsEmptyTextNode,
 nodeIsTextNode, tagName, walkTree} = Trix

class Trix.LocationMapper
  constructor: (@element) ->

  findLocationFromContainerAndOffset: (container, offset) ->
    childIndex = 0
    foundBlock = false
    location = index: 0, offset: 0

    walker = walkTree(@element, usingFilter: skipFigureContentsFilter)

    while walker.nextNode()
      node = walker.currentNode

      if node is container and nodeIsTextNode(container)
        unless nodeIsCursorTarget(node)
          location.offset += translateTextNodeOffset(node, offset)
        break

      else
        if node.parentNode is container
          break if childIndex++ is offset

        if nodeIsBlockStartComment(node)
          location.index++ if foundBlock
          location.offset = 0
          foundBlock = true
        else
          location.offset += nodeLength(node)

    location

  findContainerAndOffsetFromLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.offset is 0

    [node, nodeOffset] = @findNodeAndOffsetFromLocation(location)
    return unless node

    if nodeIsTextNode(node)
      container = node
      string = Trix.UTF16String.box(node.textContent)
      offset = string.offsetToUCS2Offset(location.offset - nodeOffset)

    else
      container = node.parentNode
      offset = [node.parentNode.childNodes...].indexOf(node) + (if location.offset is 0 then 0 else 1)

    [container, offset]

  findNodeAndOffsetFromLocation: (location) ->
    offset = 0

    for currentNode in @getNodesForIndex(location.index)
      length = nodeLength(currentNode)

      if location.offset <= offset + length
        if nodeIsTextNode(currentNode)
          node = currentNode
          nodeOffset = offset
          break if location.offset is nodeOffset and nodeIsCursorTarget(node)

        else if not node
          node = currentNode
          nodeOffset = offset

      offset += length
      break if offset > location.offset

    [node, nodeOffset]

  # Private

  getNodesForIndex: (index) ->
    nodes = []
    walker = walkTree(@element, usingFilter: emptyTextNodeFilter)
    recordingNodes = false

    while walker.nextNode()
      node = walker.currentNode
      if nodeIsBlockStartComment(node)
        if blockIndex?
          blockIndex++
        else
          blockIndex = 0

        if blockIndex is index
          recordingNodes = true
        else if recordingNodes
          break
      else if recordingNodes
        nodes.push(node)

    nodes

  nodeLength = (node) ->
    if node.nodeType is Node.TEXT_NODE
      if nodeIsCursorTarget(node)
        0
      else if findClosestElementFromNode(node)?.isContentEditable
        string = Trix.UTF16String.box(node.textContent)
        string.length
      else
        0
    else if tagName(node) in ["br", "figure"]
      1
    else
      0

  translateTextNodeOffset = (node, offset) ->
    string = Trix.UTF16String.box(node.textContent)
    string.offsetFromUCS2Offset(offset)

  emptyTextNodeFilter = (node) ->
    if nodeIsEmptyTextNode(node)
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

  skipFigureContentsFilter = (node) ->
    if tagName(node.parentNode) is "figure"
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT
