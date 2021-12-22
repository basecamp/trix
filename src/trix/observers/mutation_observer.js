import BasicObject from "trix/core/basic_object"

import {
  findClosestElementFromNode,
  nodeIsBlockStartComment,
  nodeIsEmptyTextNode,
  normalizeSpaces,
  summarizeStringChange,
  tagName,
} from "trix/core/helpers"

const mutableAttributeName = "data-trix-mutable"
const mutableSelector = `[${mutableAttributeName}]`

const options = {
  attributes: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
  subtree: true,
}

export default class MutationObserver extends BasicObject {
  constructor(element) {
    super(element)
    this.didMutate = this.didMutate.bind(this)
    this.element = element
    this.observer = new window.MutationObserver(this.didMutate)
    this.start()
  }

  start() {
    this.reset()
    return this.observer.observe(this.element, options)
  }

  stop() {
    return this.observer.disconnect()
  }

  didMutate(mutations) {
    this.mutations.push(...Array.from(this.findSignificantMutations(mutations) || []))

    if (this.mutations.length) {
      this.delegate?.elementDidMutate?.(this.getMutationSummary())
      return this.reset()
    }
  }

  // Private

  reset() {
    this.mutations = []
  }

  findSignificantMutations(mutations) {
    return mutations.filter((mutation) => {
      return this.mutationIsSignificant(mutation)
    })
  }

  mutationIsSignificant(mutation) {
    if (this.nodeIsMutable(mutation.target)) {
      return false
    }
    for (const node of Array.from(this.nodesModifiedByMutation(mutation))) {
      if (this.nodeIsSignificant(node)) return true
    }
    return false
  }

  nodeIsSignificant(node) {
    return node !== this.element && !this.nodeIsMutable(node) && !nodeIsEmptyTextNode(node)
  }

  nodeIsMutable(node) {
    return findClosestElementFromNode(node, { matchingSelector: mutableSelector })
  }

  nodesModifiedByMutation(mutation) {
    const nodes = []
    switch (mutation.type) {
      case "attributes":
        if (mutation.attributeName !== mutableAttributeName) {
          nodes.push(mutation.target)
        }
        break
      case "characterData":
        // Changes to text nodes should consider the parent element
        nodes.push(mutation.target.parentNode)
        nodes.push(mutation.target)
        break
      case "childList":
        // Consider each added or removed node
        nodes.push(...Array.from(mutation.addedNodes || []))
        nodes.push(...Array.from(mutation.removedNodes || []))
        break
    }
    return nodes
  }

  getMutationSummary() {
    return this.getTextMutationSummary()
  }

  getTextMutationSummary() {
    const { additions, deletions } = this.getTextChangesFromCharacterData()
    const textChanges = this.getTextChangesFromChildList()

    Array.from(textChanges.additions).forEach((addition) => {
      if (!Array.from(additions).includes(addition)) {
        additions.push(addition)
      }
    })

    deletions.push(...Array.from(textChanges.deletions || []))

    const summary = {}

    const added = additions.join("")
    if (added) {
      summary.textAdded = added
    }

    const deleted = deletions.join("")
    if (deleted) {
      summary.textDeleted = deleted
    }

    return summary
  }

  getMutationsByType(type) {
    return Array.from(this.mutations).filter((mutation) => mutation.type === type)
  }

  getTextChangesFromChildList() {
    let textAdded, textRemoved
    const addedNodes = []
    const removedNodes = []

    Array.from(this.getMutationsByType("childList")).forEach((mutation) => {
      addedNodes.push(...Array.from(mutation.addedNodes || []))
      removedNodes.push(...Array.from(mutation.removedNodes || []))
    })

    const singleBlockCommentRemoved =
      addedNodes.length === 0 && removedNodes.length === 1 && nodeIsBlockStartComment(removedNodes[0])

    if (singleBlockCommentRemoved) {
      textAdded = []
      textRemoved = [ "\n" ]
    } else {
      textAdded = getTextForNodes(addedNodes)
      textRemoved = getTextForNodes(removedNodes)
    }

    const additions = textAdded.filter((text, index) => text !== textRemoved[index]).map(normalizeSpaces)
    const deletions = textRemoved.filter((text, index) => text !== textAdded[index]).map(normalizeSpaces)

    return { additions, deletions }
  }

  getTextChangesFromCharacterData() {
    let added, removed
    const characterMutations = this.getMutationsByType("characterData")

    if (characterMutations.length) {
      const startMutation = characterMutations[0],
        endMutation = characterMutations[characterMutations.length - 1]

      const oldString = normalizeSpaces(startMutation.oldValue)
      const newString = normalizeSpaces(endMutation.target.data)
      const summarized = summarizeStringChange(oldString, newString)
      added = summarized.added
      removed = summarized.removed
    }

    return {
      additions: added ? [ added ] : [],
      deletions: removed ? [ removed ] : [],
    }
  }
}

const getTextForNodes = function(nodes = []) {
  const text = []
  for (const node of Array.from(nodes)) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        text.push(node.data)
        break
      case Node.ELEMENT_NODE:
        if (tagName(node) === "br") {
          text.push("\n")
        } else {
          text.push(...Array.from(getTextForNodes(node.childNodes) || []))
        }
        break
    }
  }
  return text
}
