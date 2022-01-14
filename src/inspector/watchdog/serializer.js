export default class Serializer {
  constructor(element) {
    this.element = element
    this.id = 0
    this.serializeTree()
    this.serializeSelection()
  }

  serializeTree() {
    this.ids = new Map()
    this.tree = this.serializeNode(this.element)
  }

  serializeNode(node) {
    const object = { id: ++this.id, name: node.nodeName }
    this.ids.set(node, object.id)

    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        this.serializeElementToObject(node, object)
        this.serializeElementChildrenToObject(node, object)
        break

      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
        this.serializeNodeValueToObject(node, object)
        break
    }

    return object
  }

  serializeElementToObject(node, object) {
    const attributes = {}
    let hasAttributes = false

    Array.from(node.attributes).forEach(({ name }) => {
      if (node.hasAttribute(name)) {
        let value = node.getAttribute(name)
        if (name === "src" && value.slice(0, 5) === "data:") {
          value = "data:"
        }
        attributes[name] = value
        hasAttributes = true
      }
    })

    if (hasAttributes) {
      object.attributes = attributes
    }
  }

  serializeElementChildrenToObject(node, object) {
    if (node.childNodes.length) {
      object.children = Array.from(node.childNodes).map((childNode) => this.serializeNode(childNode))
    }
  }

  serializeNodeValueToObject(node, object) {
    object.value = node.nodeValue
  }

  serializeSelection() {
    const selection = window.getSelection()
    if (selection.rangeCount <= 0) return

    const range = selection.getRangeAt(0)
    const startId = this.ids.get(range?.startContainer)
    const endId = this.ids.get(range?.endContainer)

    if (startId && endId) {
      this.selection = {
        start: { id: startId, offset: range.startOffset },
        end: { id: endId, offset: range.endOffset },
      }
    }
  }

  getSnapshot() {
    return { tree: this.tree, selection: this.selection }
  }
}
