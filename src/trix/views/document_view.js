import { makeElement } from "trix/core/helpers"

import ElementStore from "trix/core/collections/element_store"
import ObjectGroup from "trix/core/collections/object_group"
import ObjectView from "trix/views/object_view"
import BlockView from "trix/views/block_view"

import { defer } from "trix/core/helpers"

export default class DocumentView extends ObjectView {
  static render(document) {
    const element = makeElement("div")
    const view = new this(document, { element })
    view.render()
    view.sync()
    return element
  }

  constructor() {
    super(...arguments)
    this.element = this.options.element
    this.elementStore = new ElementStore()
    this.setDocument(this.object)
  }

  setDocument(document) {
    if (!document.isEqualTo(this.document)) {
      this.document = this.object = document
    }
  }

  render() {
    this.childViews = []

    this.shadowElement = makeElement("div")

    if (!this.document.isEmpty()) {
      const objects = ObjectGroup.groupObjects(this.document.getBlocks(), { asTree: true })

      Array.from(objects).forEach((object) => {
        const view = this.findOrCreateCachedChildView(BlockView, object)
        Array.from(view.getNodes()).map((node) => this.shadowElement.appendChild(node))
      })
    }
  }

  isSynced() {
    return elementsHaveEqualHTML(this.shadowElement, this.element)
  }

  sync() {
    const fragment = this.createDocumentFragmentForSync()
    while (this.element.lastChild) {
      this.element.removeChild(this.element.lastChild)
    }
    this.element.appendChild(fragment)
    return this.didSync()
  }

  // Private

  didSync() {
    this.elementStore.reset(findStoredElements(this.element))
    return defer(() => this.garbageCollectCachedViews())
  }

  createDocumentFragmentForSync() {
    const fragment = document.createDocumentFragment()

    Array.from(this.shadowElement.childNodes).forEach((node) => {
      fragment.appendChild(node.cloneNode(true))
    })

    Array.from(findStoredElements(fragment)).forEach((element) => {
      const storedElement = this.elementStore.remove(element)
      if (storedElement) {
        element.parentNode.replaceChild(storedElement, element)
      }
    })

    return fragment
  }
}

const findStoredElements = (element) => element.querySelectorAll("[data-trix-store-key]")

const elementsHaveEqualHTML = (element, otherElement) =>
  ignoreSpaces(element.innerHTML) === ignoreSpaces(otherElement.innerHTML)

const ignoreSpaces = (html) => html.replace(/&nbsp;/g, " ")
