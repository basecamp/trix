/* eslint-disable
    id-length,
    no-cond-assign,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from "trix/config"

import { triggerEvent } from "event_helpers"
import { defer } from "trix/core/helpers"
import { selectionChangeObserver } from "trix/observers/selection_change_observer"

import rangy from "rangy"
import "rangy/lib/rangy-textrange"

window.rangy = rangy

const keyCodes = {}
for (const code in config.keyNames) {
  const name = config.keyNames[code]
  keyCodes[name] = code
}

const keys = {
  left: "ArrowLeft",
  right: "ArrowRight"
}


export var moveCursor = function(options, callback) {
  let direction, move, times
  if (typeof options === "string") {
    direction = options
  } else {
    ({
      direction
    } = options);
    ({
      times
    } = options)
  }

  if (times == null) { times = 1 }

  return (move = () => defer(function() {
    if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction] })) {
      const selection = rangy.getSelection()
      selection.move("character", direction === "right" ? 1 : -1)
      selectionChangeObserver.update()
    }

    if (--times === 0) {
      return defer(() => callback(getCursorCoordinates()))
    } else {
      return move()
    }
  }))()
}

export var expandSelection = (options, callback) => defer(function() {
  let direction, expand, times
  if (typeof options === "string") {
    direction = options
  } else {
    ({
      direction
    } = options);
    ({
      times
    } = options)
  }

  if (times == null) { times = 1 }

  return (expand = () => defer(function() {
    if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction], shiftKey: true })) {
      getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward")
    }

    if (--times === 0) {
      return defer(callback)
    } else {
      return expand()
    }
  }))()
})

export var collapseSelection = function(direction, callback) {
  const selection = rangy.getSelection()
  if (direction === "left") {
    selection.collapseToStart()
  } else {
    selection.collapseToEnd()
  }
  selectionChangeObserver.update()
  return defer(callback)
}

export var selectAll = function(callback) {
  rangy.getSelection().selectAllChildren(document.activeElement)
  selectionChangeObserver.update()
  return defer(callback)
}

export var deleteSelection = function() {
  const selection = rangy.getSelection()
  selection.getRangeAt(0).deleteContents()
  return selectionChangeObserver.update()
}

export var selectionIsCollapsed = () => rangy.getSelection().isCollapsed

export var insertNode = function(node, callback) {
  const selection = rangy.getSelection()
  const range = selection.getRangeAt(0)
  range.splitBoundaries()
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()
  selection.setSingleRange(range)
  selectionChangeObserver.update()
  if (callback) { return requestAnimationFrame(callback) }
}

export var selectNode = function(node, callback) {
  const selection = rangy.getSelection()
  selection.selectAllChildren(node)
  selectionChangeObserver.update()
  return callback?.()
}

export var createDOMRangeFromPoint = function(x, y) {
  if (document.caretPositionFromPoint) {
    const { offsetNode, offset } = document.caretPositionFromPoint(x, y)
    const domRange = document.createRange()
    domRange.setStart(offsetNode, offset)
    return domRange
  } else if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y)
  }
}

var getCursorCoordinates = function() {
  let rect
  if (rect = window.getSelection().getRangeAt(0).getClientRects()[0]) {
    return {
      clientX: rect.left,
      clientY: rect.top + rect.height / 2
    }
  }
}
