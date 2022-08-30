import * as config from "trix/config"

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
  right: "ArrowRight",
}

export const moveCursor = function (options, callback) {
  let direction, move, times
  if (typeof options === "string") {
    direction = options
  } else {
    times = options.times
    direction = options.direction
  }

  if (!times) times = 1

  return (move = () =>
    defer(() => {
      if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction] })) {
        const selection = rangy.getSelection()
        selection.move("character", direction === "right" ? 1 : -1)
        selectionChangeObserver.update()
      }

      if (--times === 0) {
        defer(() => callback(getCursorCoordinates()))
      } else {
        return move()
      }
    }))()
}

export const expandSelection = (options, callback) =>
  defer(() => {
    let direction, expand, times
    if (typeof options === "string") {
      direction = options
    } else {
      ({ direction } = options)
      times = options.times
    }

    if (!times) times = 1

    return (expand = () =>
      defer(() => {
        if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction], shiftKey: true })) {
          getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward")
        }

        if (--times === 0) {
          defer(callback)
        } else {
          return expand()
        }
      }))()
  })

export const collapseSelection = function (direction, callback) {
  const selection = rangy.getSelection()
  if (direction === "left") {
    selection.collapseToStart()
  } else {
    selection.collapseToEnd()
  }
  selectionChangeObserver.update()
  defer(callback)
}

export const selectAll = function (callback) {
  rangy.getSelection().selectAllChildren(document.activeElement)
  selectionChangeObserver.update()
  defer(callback)
}

export const deleteSelection = () => {
  const selection = rangy.getSelection()
  selection.getRangeAt(0).deleteContents()
  selectionChangeObserver.update()
}

export const selectionIsCollapsed = () => rangy.getSelection().isCollapsed

export const insertNode = function (node, callback) {
  const selection = rangy.getSelection()
  const range = selection.getRangeAt(0)
  range.splitBoundaries()
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()
  selection.setSingleRange(range)
  selectionChangeObserver.update()
  if (callback) {
    requestAnimationFrame(callback)
  }
}

export const selectNode = function (node, callback) {
  const selection = rangy.getSelection()
  selection.selectAllChildren(node)
  selectionChangeObserver.update()
  if (callback) callback()
}

export const createDOMRangeFromPoint = function (px, py) {
  if (document.caretPositionFromPoint) {
    const { offsetNode, offset } = document.caretPositionFromPoint(px, py)
    const domRange = document.createRange()
    domRange.setStart(offsetNode, offset)
    return domRange
  } else if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(px, py)
  }
}

const getCursorCoordinates = () => {
  const rect = window.getSelection().getRangeAt(0).getClientRects()[0]
  if (rect) {
    return {
      clientX: rect.left,
      clientY: rect.top + rect.height / 2,
    }
  }
}
