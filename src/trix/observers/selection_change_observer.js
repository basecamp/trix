import BasicObject from "trix/core/basic_object"

export default class SelectionChangeObserver extends BasicObject {
  constructor() {
    super(...arguments)
    this.update = this.update.bind(this)
    this.selectionManagers = []
  }

  start() {
    if (!this.started) {
      this.started = true
      document.addEventListener("selectionchange", this.update, true)
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
    this.selectionManagers = this.selectionManagers.filter((sm) => sm !== selectionManager)
    if (this.selectionManagers.length === 0) {
      return this.stop()
    }
  }

  notifySelectionManagersOfSelectionChange() {
    return this.selectionManagers.map((selectionManager) => selectionManager.selectionDidChange())
  }

  update() {
    this.notifySelectionManagersOfSelectionChange()
  }

  reset() {
    this.update()
  }
}

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
