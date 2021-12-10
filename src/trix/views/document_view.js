/* eslint-disable
    no-cond-assign,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
    super(...arguments);
    ({ element: this.element } = this.options)
    this.elementStore = new ElementStore
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
      return (() => {
        const result = []

        Array.from(objects).forEach((object) => {
          const view = this.findOrCreateCachedChildView(BlockView, object)
          result.push(Array.from(view.getNodes()).map((node) => this.shadowElement.appendChild(node)))
        })

        return result
      })()
    }
  }

  isSynced() {
    return elementsHaveEqualHTML(this.shadowElement, this.element)
  }

  sync() {
    const fragment = this.createDocumentFragmentForSync()
    while (this.element.lastChild) { this.element.removeChild(this.element.lastChild) }
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
      let storedElement
      if (storedElement = this.elementStore.remove(element)) {
        element.parentNode.replaceChild(storedElement, element)
      }
    })

    return fragment
  }
}

var findStoredElements = element => element.querySelectorAll("[data-trix-store-key]")

var elementsHaveEqualHTML = (element, otherElement) => ignoreSpaces(element.innerHTML) === ignoreSpaces(otherElement.innerHTML)

var ignoreSpaces = html => html.replace(/&nbsp;/g, " ")