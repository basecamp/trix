import * as config from "trix/config"
import { delay, nextFrame } from "./timing_helpers"
import { triggerEvent } from "./event_helpers"
import {
  collapseSelection,
  createDOMRangeFromPoint,
  deleteSelection,
  insertNode,
  selectNode,
  selectionIsCollapsed,
} from "./selection_helpers"

const keyCodes = {}

Object.keys(config.keyNames).forEach(code => {
  const name = config.keyNames[code]
  keyCodes[name] = code
})

const isIE = /Windows.*Trident/.test(navigator.userAgent)

export const triggerInputEvent = function (element, type, properties = {}) {
  if (config.input.getLevel() === 2) {
    let ranges
    if (properties.ranges) {
      ({ ranges } = properties)
      delete properties.ranges
    } else {
      ranges = []
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        ranges.push(selection.getRangeAt(0).cloneRange())
      }
    }
    properties.getTargetRanges = () => ranges
    triggerEvent(element, type, properties)
  }
}

export const pasteContent = async (contentType, value) => {
  let data

  if (typeof contentType === "object") {
    data = contentType
  } else {
    data = { [contentType]: value }
  }

  const testClipboardData = {
    getData: (type) => data[type],
    types: Object.keys(data),
    items: Object.values(data),
  }

  if (testClipboardData.types.includes("Files")) {
    testClipboardData.files = testClipboardData.items
  }

  triggerInputEvent(document.activeElement, "beforeinput", {
    inputType: "insertFromPaste",
    dataTransfer: testClipboardData,
  })

  triggerEvent(document.activeElement, "paste", { testClipboardData })

  await nextFrame()
}

export const createFile = function (properties = {}) {
  const file = {
    getAsFile() {
      return {}
    },
  }
  for (const key in properties) {
    const value = properties[key]
    file[key] = value
  }
  return file
}

export const typeCharacters = async (string) => {
  const characters = Array.isArray(string) ? string : string.split("")

  const typeNextCharacter = async () => {
    await delay(10)
    const character = characters.shift()
    if (character == null) return

    switch (character) {
      case "\n":
        await pressKey("return")
        await typeNextCharacter()
        break
      case "\b":
        await pressKey("backspace")
        await typeNextCharacter()
        break
      default:
        await typeCharacterInElement(character, document.activeElement)
        await typeNextCharacter()
    }
  }

  await typeNextCharacter()
  await delay(10)
}

export const pressKey = async (keyName) => {
  const element = document.activeElement
  const code = keyCodes[keyName]
  const properties = { which: code, keyCode: code, charCode: 0, key: capitalize(keyName) }

  if (!triggerEvent(element, "keydown", properties)) return

  await simulateKeypress(keyName)
  await nextFrame()

  triggerEvent(element, "keyup", properties)
  await nextFrame()
}

export const startComposition = async (data) => {
  const element = document.activeElement
  triggerEvent(element, "compositionstart", { data: "" })
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })
  triggerEvent(element, "input")

  const node = document.createTextNode(data)
  insertNode(node)
  await selectNode(node)
}

export const updateComposition = async (data) => {
  const element = document.activeElement
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })
  triggerEvent(element, "input")

  const node = document.createTextNode(data)
  insertNode(node)
  await selectNode(node)
}

export const endComposition = async (data) => {
  const element = document.activeElement
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })

  const node = document.createTextNode(data)
  insertNode(node)
  selectNode(node)
  await collapseSelection("right")

  triggerEvent(element, "input")
  triggerEvent(element, "compositionend", { data })

  await nextFrame()
}

export const clickElement = async (element) => {
  if (triggerEvent(element, "mousedown")) {
    await nextFrame()

    if (triggerEvent(element, "mouseup")) {
      await nextFrame()
      triggerEvent(element, "click")
      await nextFrame()
    }
  }
}

export const dragToCoordinates = async (coordinates) => {
  const element = document.activeElement

  // IE only allows writing "text" to DataTransfer
  // https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
  const dataTransfer = {
    files: [],
    data: {},
    getData(format) {
      if (isIE && format.toLowerCase() !== "text") {
        throw new Error("Invalid argument.")
      } else {
        this.data[format]
        return true
      }
    },
    setData(format, data) {
      if (isIE && format.toLowerCase() !== "text") {
        throw new Error("Unexpected call to method or property access.")
      } else {
        this.data[format] = data
      }
    },
  }

  triggerEvent(element, "mousemove")

  const dragstartData = { dataTransfer }
  triggerEvent(element, "dragstart", dragstartData)
  triggerInputEvent(element, "beforeinput", { inputType: "deleteByDrag" })

  const dropData = { dataTransfer }
  for (const key in coordinates) {
    const value = coordinates[key]
    dropData[key] = value
  }
  triggerEvent(element, "drop", dropData)

  const { clientX, clientY } = coordinates
  const domRange = createDOMRangeFromPoint(clientX, clientY)
  triggerInputEvent(element, "beforeinput", { inputType: "insertFromDrop", ranges: [ domRange ] })

  await nextFrame()
}

export const mouseDownOnElementAndMove = async (element, distance) => {
  const coordinates = getElementCoordinates(element)
  triggerEvent(element, "mousedown", coordinates)

  const destination = (offset) => ({
    clientX: coordinates.clientX + offset,
    clientY: coordinates.clientY + offset,
  })

  const dragSpeed = 20
  await delay(dragSpeed)

  let offset = 0
  const drag = async () => {
    if (++offset <= distance) {
      triggerEvent(element, "mousemove", destination(offset))
      await delay(dragSpeed)
      drag()
    } else {
      triggerEvent(element, "mouseup", destination(distance))
      await delay(dragSpeed)
    }
  }

  drag()
}

const typeCharacterInElement = async (character, element) => {
  const charCode = character.charCodeAt(0)
  const keyCode = character.toUpperCase().charCodeAt(0)

  if (!triggerEvent(element, "keydown", { keyCode, charCode: 0 })) return

  await nextFrame()

  if (!triggerEvent(element, "keypress", { keyCode: charCode, charCode })) return

  triggerInputEvent(element, "beforeinput", { inputType: "insertText", data: character })

  await insertCharacter(character)
  triggerEvent(element, "input")
  await nextFrame()

  triggerEvent(element, "keyup", { keyCode, charCode: 0 })
}

const insertCharacter = async (character) => {
  const node = document.createTextNode(character)
  await insertNode(node)
}

const simulateKeypress = async (keyName) => {
  switch (keyName) {
    case "backspace":
      await deleteInDirection("left")
      break
    case "delete":
      await deleteInDirection("right")
      break
    case "return":
      await nextFrame()
      triggerInputEvent(document.activeElement, "beforeinput", { inputType: "insertParagraph" })
      await insertNode(document.createElement("br"))
  }
}

const deleteInDirection = async (direction) => {
  if (selectionIsCollapsed()) {
    getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward")
    await nextFrame()

    const inputType = direction === "left" ? "deleteContentBackward" : "deleteContentForward"
    triggerInputEvent(document.activeElement, "beforeinput", { inputType })

    await nextFrame()
    deleteSelection()
  } else {
    triggerInputEvent(document.activeElement, "beforeinput", { inputType: "deleteContentBackward" })
    deleteSelection()
  }
}

const getElementCoordinates = function (element) {
  const rect = element.getBoundingClientRect()
  return {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  }
}

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1)
