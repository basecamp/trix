/* eslint-disable
    no-var,
    prefer-const,
*/
import {
  elementContainsNode,
  findChildIndexOfNode,
  nodeIsAttachmentElement,
  nodeIsBlockContainer,
  nodeIsBlockStart,
  nodeIsBlockStartComment,
  nodeIsCursorTarget,
  nodeIsEmptyTextNode,
  nodeIsTextNode,
  tagName,
  walkTree,
} from "trix/core/helpers"

export default class LocationMapper {
  constructor(element) {
    this.element = element
  }

  findLocationFromContainerAndOffset(container, offset, { strict } = { strict: true }) {
    let childIndex = 0
    let foundBlock = false
    const location = { index: 0, offset: 0 }
    const attachmentElement = this.findAttachmentElementParentForNode(container)

    if (attachmentElement) {
      container = attachmentElement.parentNode
      offset = findChildIndexOfNode(attachmentElement)
    }

    const walker = walkTree(this.element, { usingFilter: rejectAttachmentContents })

    while (walker.nextNode()) {
      const node = walker.currentNode

      if (node === container && nodeIsTextNode(container)) {
        if (!nodeIsCursorTarget(node)) {
          location.offset += offset
        }
        break
      } else {
        if (node.parentNode === container) {
          if (childIndex++ === offset) {
            break
          }
        } else if (!elementContainsNode(container, node)) {
          if (childIndex > 0) {
            break
          }
        }

        if (nodeIsBlockStart(node, { strict })) {
          if (foundBlock) {
            location.index++
          }
          location.offset = 0
          foundBlock = true
        } else {
          location.offset += nodeLength(node)
        }
      }
    }

    return location
  }

  findContainerAndOffsetFromLocation(location) {
    let container, offset
    if (location.index === 0 && location.offset === 0) {
      container = this.element
      offset = 0

      while (container.firstChild) {
        container = container.firstChild
        if (nodeIsBlockContainer(container)) {
          offset = 1
          break
        }
      }

      return [ container, offset ]
    }

    let [ node, nodeOffset ] = this.findNodeAndOffsetFromLocation(location)
    if (!node) return

    if (nodeIsTextNode(node)) {
      if (nodeLength(node) === 0) {
        container = node.parentNode.parentNode
        offset = findChildIndexOfNode(node.parentNode)
        if (nodeIsCursorTarget(node, { name: "right" })) {
          offset++
        }
      } else {
        container = node
        offset = location.offset - nodeOffset
      }
    } else {
      container = node.parentNode

      if (!nodeIsBlockStart(node.previousSibling)) {
        if (!nodeIsBlockContainer(container)) {
          while (node === container.lastChild) {
            node = container
            container = container.parentNode
            if (nodeIsBlockContainer(container)) {
              break
            }
          }
        }
      }

      offset = findChildIndexOfNode(node)
      if (location.offset !== 0) {
        offset++
      }
    }

    return [ container, offset ]
  }

  findNodeAndOffsetFromLocation(location) {
    let node, nodeOffset
    let offset = 0

    for (const currentNode of this.getSignificantNodesForIndex(location.index)) {
      const length = nodeLength(currentNode)

      if (location.offset <= offset + length) {
        if (nodeIsTextNode(currentNode)) {
          node = currentNode
          nodeOffset = offset
          if (location.offset === nodeOffset && nodeIsCursorTarget(node)) {
            break
          }
        } else if (!node) {
          node = currentNode
          nodeOffset = offset
        }
      }

      offset += length
      if (offset > location.offset) {
        break
      }
    }

    return [ node, nodeOffset ]
  }

  // Private

  findAttachmentElementParentForNode(node) {
    while (node && node !== this.element) {
      if (nodeIsAttachmentElement(node)) {
        return node
      }
      node = node.parentNode
    }
  }

  getSignificantNodesForIndex(index) {
    const nodes = []
    const walker = walkTree(this.element, { usingFilter: acceptSignificantNodes })
    let recordingNodes = false

    while (walker.nextNode()) {
      const node = walker.currentNode
      if (nodeIsBlockStartComment(node)) {
        var blockIndex
        if (blockIndex != null) {
          blockIndex++
        } else {
          blockIndex = 0
        }

        if (blockIndex === index) {
          recordingNodes = true
        } else if (recordingNodes) {
          break
        }
      } else if (recordingNodes) {
        nodes.push(node)
      }
    }

    return nodes
  }
}

const nodeLength = function(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (nodeIsCursorTarget(node)) {
      return 0
    } else {
      const string = node.textContent
      return string.length
    }
  } else if (tagName(node) === "br" || nodeIsAttachmentElement(node)) {
    return 1
  } else {
    return 0
  }
}

const acceptSignificantNodes = function(node) {
  if (rejectEmptyTextNodes(node) === NodeFilter.FILTER_ACCEPT) {
    return rejectAttachmentContents(node)
  } else {
    return NodeFilter.FILTER_REJECT
  }
}

const rejectEmptyTextNodes = function(node) {
  if (nodeIsEmptyTextNode(node)) {
    return NodeFilter.FILTER_REJECT
  } else {
    return NodeFilter.FILTER_ACCEPT
  }
}

const rejectAttachmentContents = function(node) {
  if (nodeIsAttachmentElement(node.parentNode)) {
    return NodeFilter.FILTER_REJECT
  } else {
    return NodeFilter.FILTER_ACCEPT
  }
}
