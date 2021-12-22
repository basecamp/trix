export default class Deserializer {
  constructor(document, snapshot) {
    this.document = document
    this.snapshot = snapshot
    this.tree = this.snapshot.tree
    this.selection = this.snapshot.selection
    this.deserializeTree()
    this.deserializeSelection()
  }

  deserializeTree() {
    this.nodes = {}
    this.element = this.deserializeNode(this.tree)
  }

  deserializeNode(serializedNode) {
    let node
    switch (serializedNode.name) {
      case "#text":
        node = this.deserializeTextNode(serializedNode)
        break
      case "#comment":
        node = this.deserializeComment(serializedNode)
        break
      default:
        node = this.deserializeElement(serializedNode)
        break
    }

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
    const children = serializedNode.children ? Array.from(serializedNode.children) : []
    return children.map((child) => this.deserializeNode(child))
  }

  deserializeElement(serializedNode) {
    const node = this.document.createElement(serializedNode.name)
    const object = serializedNode.attributes ? serializedNode.attributes : {}
    for (const name in object) {
      const value = object[name]
      node.setAttribute(name, value)
    }
    while (node.lastChild) {
      node.removeChild(node.lastChild)
    }
    this.deserializeChildren(serializedNode).forEach((childNode) => {
      node.appendChild(childNode)
    })
    return node
  }

  deserializeSelection() {
    if (!this.selection) return

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
