/* eslint-disable
    id-length,
*/
import BasicObject from "trix/core/basic_object"

export default class SelectionChangeObserver extends BasicObject {
  constructor() {
    super(...arguments)
    this.update = this.update.bind(this)
    this.run = this.run.bind(this)
    this.selectionManagers = []
  }

  start() {
    if (!this.started) {
      this.started = true
      if ("onselectionchange" in document) {
        return document.addEventListener("selectionchange", this.update, true)
      } else {
        return this.run()
      }
    }
  }

  stop() {
    if (this.started) {
      this.started = false
      return document.removeEventListener("selectionchange", this.update, true)
    }
  }

  registerSelectionManager(selectionManager) {
    if (!this.selectionManagers.includes(selectionManager)) {
      this.selectionManagers.push(selectionManager)
      return this.start()
    }
  }

  unregisterSelectionManager(selectionManager) {
    this.selectionManagers = this.selectionManagers.filter((s) => s !== selectionManager)
    if (this.selectionManagers.length === 0) {
      return this.stop()
    }
  }

  notifySelectionManagersOfSelectionChange() {
    return this.selectionManagers.map((selectionManager) => selectionManager.selectionDidChange())
  }

  update() {
    const domRange = getDOMRange()
    if (!domRangesAreEqual(domRange, this.domRange)) {
      this.domRange = domRange
      return this.notifySelectionManagersOfSelectionChange()
    }
  }

  reset() {
    this.domRange = null
    return this.update()
  }

  // Private

  run() {
    if (this.started) {
      this.update()
      return requestAnimationFrame(this.run)
    }
  }
}

const domRangesAreEqual = (left, right) =>
  left?.startContainer === right?.startContainer &&
  left?.startOffset === right?.startOffset &&
  left?.endContainer === right?.endContainer &&
  left?.endOffset === right?.endOffset

export const selectionChangeObserver = new SelectionChangeObserver()

export const getDOMSelection = function() {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    return selection
  }
}

export const getDOMRange = function() {
  const domRange = getDOMSelection()?.getRangeAt(0)
  if (domRange) {
    if (!domRangeIsPrivate(domRange)) {
      return domRange
    }
  }
}

export const setDOMRange = function(domRange) {
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(domRange)
  return selectionChangeObserver.update()
}

// In Firefox, clicking certain <input> elements changes the selection to a
// private element used to draw its UI. Attempting to access properties of those
// elements throws an error.
// https://bugzilla.mozilla.org/show_bug.cgi?id=208427
const domRangeIsPrivate = (domRange) => nodeIsPrivate(domRange.startContainer) || nodeIsPrivate(domRange.endContainer)

const nodeIsPrivate = (node) => !Object.getPrototypeOf(node)
