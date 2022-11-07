import blockAttributes from "trix/config/block_attributes"
import { ZERO_WIDTH_SPACE } from "trix/constants"
import { extend } from "./extend"
import { attachmentSelector } from "trix/config/attachments"

const html = document.documentElement
const match = html.matches

export const handleEvent = function(eventName, { onElement, matchingSelector, withCallback, inPhase, preventDefault, times } = {}) {
  const element = onElement ? onElement : html
  const selector = matchingSelector
  const useCapture = inPhase === "capturing"

  const handler = function(event) {
    if (times != null && --times === 0) {
      handler.destroy()
    }
    const target = findClosestElementFromNode(event.target, { matchingSelector: selector })
    if (target != null) {
      withCallback?.call(target, event, target)
      if (preventDefault) {
        event.preventDefault()
      }
    }
  }

  handler.destroy = () => element.removeEventListener(eventName, handler, useCapture)

  element.addEventListener(eventName, handler, useCapture)
  return handler
}

export const handleEventOnce = function(eventName, options = {}) {
  options.times = 1
  return handleEvent(eventName, options)
}

export const triggerEvent = function(eventName, { onElement, bubbles, cancelable, attributes } = {}) {
  const element = onElement != null ? onElement : html
  bubbles = bubbles !== false
  cancelable = cancelable !== false

  const event = document.createEvent("Events")
  event.initEvent(eventName, bubbles, cancelable)
  if (attributes != null) {
    extend.call(event, attributes)
  }
  return element.dispatchEvent(event)
}

export const elementMatchesSelector = function(element, selector) {
  if (element?.nodeType === 1) {
    return match.call(element, selector)
  }
}

export const findClosestElementFromNode = function(node, { matchingSelector, untilNode } = {}) {
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode
  }
  if (node == null) {
    return
  }

  if (matchingSelector != null) {
    if (node.closest && untilNode == null) {
      return node.closest(matchingSelector)
    } else {
      while (node && node !== untilNode) {
        if (elementMatchesSelector(node, matchingSelector)) {
          return node
        }
        node = node.parentNode
      }
    }
  } else {
    return node
  }
}

export const findInnerElement = function(element) {
  while (element?.firstElementChild) {
    element = element.firstElementChild
  }
  return element
}

export const innerElementIsActive = (element) =>
  document.activeElement !== element && elementContainsNode(element, document.activeElement)

export const elementContainsNode = function(element, node) {
  if (!element || !node) {
    return
  }
  while (node) {
    if (node === element) {
      return true
    }
    node = node.parentNode
  }
}

export const findNodeFromContainerAndOffset = function(container, offset) {
  if (!container) {
    return
  }
  if (container.nodeType === Node.TEXT_NODE) {
    return container
  } else if (offset === 0) {
    return container.firstChild != null ? container.firstChild : container
  } else {
    return container.childNodes.item(offset - 1)
  }
}

export const findElementFromContainerAndOffset = function(container, offset) {
  const node = findNodeFromContainerAndOffset(container, offset)
  return findClosestElementFromNode(node)
}

export const findChildIndexOfNode = function(node) {
  if (!node?.parentNode) {
    return
  }
  let childIndex = 0
  node = node.previousSibling
  while (node) {
    childIndex++
    node = node.previousSibling
  }
  return childIndex
}

export const removeNode = (node) => node?.parentNode?.removeChild(node)

export const walkTree = function(tree, { onlyNodesOfType, usingFilter, expandEntityReferences } = {}) {
  const whatToShow = (() => {
    switch (onlyNodesOfType) {
      case "element":
        return NodeFilter.SHOW_ELEMENT
      case "text":
        return NodeFilter.SHOW_TEXT
      case "comment":
        return NodeFilter.SHOW_COMMENT
      default:
        return NodeFilter.SHOW_ALL
    }
  })()

  return document.createTreeWalker(
    tree,
    whatToShow,
    usingFilter != null ? usingFilter : null,
    expandEntityReferences === true
  )
}

export const tagName = (element) => element?.tagName?.toLowerCase()

export const makeElement = function(tag, options = {}) {
  let key, value
  if (typeof tag === "object") {
    options = tag
    tag = options.tagName
  } else {
    options = { attributes: options }
  }

  const element = document.createElement(tag)

  if (options.editable != null) {
    if (options.attributes == null) {
      options.attributes = {}
    }
    options.attributes.contenteditable = options.editable
  }

  if (options.attributes) {
    for (key in options.attributes) {
      value = options.attributes[key]
      element.setAttribute(key, value)
    }
  }

  if (options.style) {
    for (key in options.style) {
      value = options.style[key]
      element.style[key] = value
    }
  }

  if (options.data) {
    for (key in options.data) {
      value = options.data[key]
      element.dataset[key] = value
    }
  }

  if (options.className) {
    options.className.split(" ").forEach((className) => {
      element.classList.add(className)
    })
  }

  if (options.textContent) {
    element.textContent = options.textContent
  }

  if (options.childNodes) {
    [].concat(options.childNodes).forEach((childNode) => {
      element.appendChild(childNode)
    })
  }

  return element
}

let blockTagNames = undefined

export const getBlockTagNames = function() {
  if (blockTagNames != null) {
    return blockTagNames
  }

  blockTagNames = []
  for (const key in blockAttributes) {
    const attributes = blockAttributes[key]
    if (attributes.tagName) {
      blockTagNames.push(attributes.tagName)
    }
  }

  return blockTagNames
}

export const nodeIsBlockContainer = (node) => nodeIsBlockStartComment(node?.firstChild)

export const nodeProbablyIsBlockContainer = function(node) {
  return getBlockTagNames().includes(tagName(node)) && !getBlockTagNames().includes(tagName(node.firstChild))
}

export const nodeIsBlockStart = function(node, { strict } = { strict: true }) {
  if (strict) {
    return nodeIsBlockStartComment(node)
  } else {
    return (
      nodeIsBlockStartComment(node) || !nodeIsBlockStartComment(node.firstChild) && nodeProbablyIsBlockContainer(node)
    )
  }
}

export const nodeIsBlockStartComment = (node) => nodeIsCommentNode(node) && node?.data === "block"

export const nodeIsCommentNode = (node) => node?.nodeType === Node.COMMENT_NODE

export const nodeIsCursorTarget = function(node, { name } = {}) {
  if (!node) {
    return
  }
  if (nodeIsTextNode(node)) {
    if (node.data === ZERO_WIDTH_SPACE) {
      if (name) {
        return node.parentNode.dataset.trixCursorTarget === name
      } else {
        return true
      }
    }
  } else {
    return nodeIsCursorTarget(node.firstChild)
  }
}

export const nodeIsAttachmentElement = (node) => elementMatchesSelector(node, attachmentSelector)

export const nodeIsEmptyTextNode = (node) => nodeIsTextNode(node) && node?.data === ""

export const nodeIsTextNode = (node) => node?.nodeType === Node.TEXT_NODE
