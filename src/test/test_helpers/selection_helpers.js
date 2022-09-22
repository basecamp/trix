import * as config from "trix/config"

import { triggerEvent } from "event_helpers"
import { selectionChangeObserver } from "trix/observers/selection_change_observer"

import rangy from "rangy"
import "rangy/lib/rangy-textrange"
import { nextFrame } from "./timing_helpers"

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

export const moveCursor = async (options) => {
  let direction, times
  if (typeof options === "string") {
    direction = options
  } else {
    times = options.times
    direction = options.direction
  }

  if (!times) times = 1

  const move = async () => {
    await nextFrame()

    if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction] })) {
      const selection = rangy.getSelection()
      selection.move("character", direction === "right" ? 1 : -1)
      selectionChangeObserver.update()
    }

    if (--times === 0) {
      await nextFrame()
      return getCursorCoordinates()
    } else {
      return move()
    }
  }
  return await move()
}

export const expandSelection = async (options) => {
  await nextFrame()

  let direction, times
  if (typeof options === "string") {
    direction = options
  } else {
    ({ direction } = options)
    times = options.times
  }

  if (!times) times = 1

  const expand = async () => {
    await nextFrame()

    if (triggerEvent(document.activeElement, "keydown", { keyCode: keyCodes[direction], key: keys[direction], shiftKey: true })) {
      getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward")
    }

    if (--times === 0) {
      await nextFrame()
    } else {
      return await expand()
    }
  }

  return await expand()
}

export const collapseSelection = async (direction) => {
  const selection = rangy.getSelection()
  if (direction === "left") {
    selection.collapseToStart()
  } else {
    selection.collapseToEnd()
  }
  selectionChangeObserver.update()
  await nextFrame()
}

export const selectAll = async () => {
  rangy.getSelection().selectAllChildren(document.activeElement)
  selectionChangeObserver.update()
  await nextFrame()
}

export const deleteSelection = () => {
  const selection = rangy.getSelection()
  selection.getRangeAt(0).deleteContents()
  selectionChangeObserver.update()
}

export const selectionIsCollapsed = () => rangy.getSelection().isCollapsed

export const insertNode = async (node) => {
  const selection = rangy.getSelection()
  const range = selection.getRangeAt(0)
  range.splitBoundaries()
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()
  selection.setSingleRange(range)
  selectionChangeObserver.update()

  await nextFrame()
}

export const selectNode = async (node) => {
  const selection = rangy.getSelection()
  selection.selectAllChildren(node)
  selectionChangeObserver.update()
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
