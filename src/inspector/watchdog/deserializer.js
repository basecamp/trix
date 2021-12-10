// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class Deserializer {
  constructor(document, snapshot) {
    this.document = document
    this.snapshot = snapshot;
    ({ tree: this.tree, selection: this.selection } = this.snapshot)
    this.deserializeTree()
    this.deserializeSelection()
  }

  deserializeTree() {
    this.nodes = {}
    this.element = this.deserializeNode(this.tree)
  }

  deserializeNode(serializedNode) {
    const node = (() => { switch (serializedNode.name) {
      case "#text":
        return this.deserializeTextNode(serializedNode)
      case "#comment":
        return this.deserializeComment(serializedNode)
      default:
        return this.deserializeElement(serializedNode)
    } })()

    this.nodes[serializedNode.id] = node
    return node
  }

  deserializeTextNode({ value }) {
    return this.document.createTextNode(value)
  }

  deserializeComment({ value }) {
    return this.document.createComment(value)
  }

  deserializeChildren(serializedNode) {
    return Array.from(serializedNode.children != null ? serializedNode.children : []).map((child) =>
      this.deserializeNode(child))
  }

  deserializeElement(serializedNode) {
    const node = this.document.createElement(serializedNode.name)
    const object = serializedNode.attributes != null ? serializedNode.attributes : {}
    for (const name in object) { const value = object[name]; node.setAttribute(name, value) }
    while (node.lastChild) { node.removeChild(node.lastChild) }
    Array.from(this.deserializeChildren(serializedNode)).forEach((childNode) => { node.appendChild(childNode) })
    return node
  }

  deserializeSelection() {
    if (!this.selection) { return }
    const { start, end } = this.selection
    const startContainer = this.nodes[start.id]
    const endContainer = this.nodes[end.id]

    this.range = this.document.createRange()
    this.range.setStart(startContainer, start.offset)
    this.range.setEnd(endContainer, end.offset)
    return this.range
  }

  getElement() {
    return this.element
  }

  getRange() {
    return this.range
  }
}
