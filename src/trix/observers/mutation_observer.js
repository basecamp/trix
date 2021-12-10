/* eslint-disable
    no-cond-assign,
    no-this-before-super,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MutationObserver
import BasicObject from "trix/core/basic_object"

import { findClosestElementFromNode, nodeIsBlockStartComment, nodeIsEmptyTextNode,
normalizeSpaces, summarizeStringChange, tagName } from "trix/core/helpers"

const mutableAttributeName = "data-trix-mutable"
const mutableSelector = `[${mutableAttributeName}]`

export default MutationObserver = (function() {
  let options = undefined
  MutationObserver = class MutationObserver extends BasicObject {
    static initClass() {
      options = {
        attributes: true,
        childList: true,
        characterData: true,
        characterDataOldValue: true,
        subtree: true
      }
    }

    constructor(element) {
      this.didMutate = this.didMutate.bind(this)
      super(...arguments)
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
      return (() => {
        const result = []

        Array.from(mutations).forEach(
          (mutation) => { if (this.mutationIsSignificant(mutation)) {
              result.push(mutation)
            }
          }
        )

        return result
      })()
    }

    mutationIsSignificant(mutation) {
      if (this.nodeIsMutable(mutation.target)) { return false }
      for (const node of Array.from(this.nodesModifiedByMutation(mutation))) { if (this.nodeIsSignificant(node)) { return true } }
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
      let added, deleted
      const { additions, deletions } = this.getTextChangesFromCharacterData()

      const textChanges = this.getTextChangesFromChildList()

      Array.from(textChanges.additions).forEach(
        (addition) => { if (!Array.from(additions).includes(addition)) { additions.push(addition) } }
      )

      deletions.push(...Array.from(textChanges.deletions || []))

      const summary = {}
      if (added = additions.join("")) { summary.textAdded = added }
      if (deleted = deletions.join("")) { summary.textDeleted = deleted }
      return summary
    }

    getMutationsByType(type) {
      return Array.from(this.mutations).filter((mutation) => mutation.type === type)
    }

    getTextChangesFromChildList() {
      let textAdded, textRemoved
      let index, text
      const addedNodes = []
      const removedNodes = []

      Array.from(this.getMutationsByType("childList")).forEach((mutation) => {
        addedNodes.push(...Array.from(mutation.addedNodes || []))
        removedNodes.push(...Array.from(mutation.removedNodes || []))
      })

      const singleBlockCommentRemoved =
        addedNodes.length === 0 &&
          removedNodes.length === 1 &&
          nodeIsBlockStartComment(removedNodes[0])

      if (singleBlockCommentRemoved) {
        textAdded = []
        textRemoved = [ "\n" ]
      } else {
        textAdded = getTextForNodes(addedNodes)
        textRemoved = getTextForNodes(removedNodes)
      }

      return {
        additions: (() => {
          const result = []
          for (index = 0; index < textAdded.length; index++) {
            text = textAdded[index]
            if (text !== textRemoved[index]) {
              result.push(normalizeSpaces(text))
            }
          }
          return result
        })(),
        deletions: (() => {
          const result1 = []
          for (index = 0; index < textRemoved.length; index++) {
            text = textRemoved[index]
            if (text !== textAdded[index]) {
              result1.push(normalizeSpaces(text))
            }
          }
          return result1
        })()
      }
    }

    getTextChangesFromCharacterData() {
      let added, removed
      const characterMutations = this.getMutationsByType("characterData")

      if (characterMutations.length) {
        const startMutation = characterMutations[0], endMutation = characterMutations[characterMutations.length - 1]

        const oldString = normalizeSpaces(startMutation.oldValue)
        const newString = normalizeSpaces(endMutation.target.data);
        ({ added, removed } = summarizeStringChange(oldString, newString))
      }

      return {
        additions: added ? [ added ] : [],
        deletions: removed ? [ removed ] : []
      }
    }
  }
  MutationObserver.initClass()
  return MutationObserver
})()

var getTextForNodes = function(nodes = []) {
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
