{findClosestElementFromNode, findNodeFromContainerAndOffset,
 nodeIsCursorTarget, tagName, walkTree} = Trix

class Trix.LocationMapper
  constructor: (@element) ->

  findLocationFromContainerAndOffset: (container, containerOffset) ->
    index = offset = 0

    if container is @element
      if containerOffset > 0
        index = containerOffset - 1
        offset += nodeLength(node) for node in @getNodesForIndex(index)
    else
      targetNode = findNodeFromContainerAndOffset(container, containerOffset)
      walker = walkTree(@element)

      while walker.nextNode()
        node = walker.currentNode

        if nodeIsBlockStartComment(node)
          if currentBlockComment
            index++
          else
            currentBlockComment = node
          offset = 0

        if node is targetNode
          if container.nodeType is Node.TEXT_NODE and not nodeIsCursorTarget(node)
            string = Trix.UTF16String.box(node.textContent)
            offset += string.offsetFromUCS2Offset(containerOffset)
          else if containerOffset > 0
            offset += nodeLength(node)
          return {index, offset}
        else
          offset += nodeLength(node)

    {index, offset}

  findContainerAndOffsetFromLocation: (location) ->
    return [@element, 0] if location.index is 0 and location.offset is 0

    [node, nodeOffset] = @findNodeAndOffsetFromLocation(location)
    return unless node

    if node.nodeType is Node.TEXT_NODE
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
        if currentNode.nodeType is Node.TEXT_NODE
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

  nodeIsBlockStartComment = (node) ->
    node.nodeType is Node.COMMENT_NODE and node.data is "block"

  nodeIsEmptyTextNode = (node) ->
    node.nodeType is Node.TEXT_NODE and node.data is ""

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

  emptyTextNodeFilter = (node) ->
    if nodeIsEmptyTextNode(node)
      NodeFilter.FILTER_REJECT
    else
      NodeFilter.FILTER_ACCEPT

