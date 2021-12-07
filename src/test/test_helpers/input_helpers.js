/* eslint-disable
    no-redeclare,
    no-undef,
    no-unused-vars,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let code
import config from "trix/config"
import { defer } from "trix/core/helpers"
import { createEvent, triggerEvent } from "./event_helpers"
import { collapseSelection, createDOMRangeFromPoint, deleteSelection, insertNode,
  selectNode, selectionIsCollapsed } from "./selection_helpers"

const keyCodes = {}
for (code in config.keyNames) {
  const name = config.keyNames[code]
  keyCodes[name] = code
}

const isIE = /Windows.*Trident/.test(navigator.userAgent)

export var triggerInputEvent = function(element, type, properties = {}) {
  if (config.input.getLevel() === 2) {
    let ranges
    if (properties.ranges) {
      ({
        ranges
      } = properties)
      delete properties.ranges
    } else {
      ranges = []
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        ranges.push(selection.getRangeAt(0).cloneRange())
      }
    }
    properties.getTargetRanges = () => ranges
    return triggerEvent(element, type, properties)
  }
}

export var pasteContent = function(contentType, value, callback) {
  let data
  var key, value
  if (typeof contentType === "object") {
    data = contentType
    callback = value
  } else {
    data = { [contentType]: value }
  }

  const testClipboardData = {
    getData(type) {
      return data[type]
    },
    types: (() => {
      const result = []
      for (key in data) {
        result.push(key)
      }
      return result
    })(),
    items: (() => {
      const result1 = []
      for (key in data) {
        value = data[key]
        result1.push(value)
      }
      return result1
    })()
  }

  if (Array.from(testClipboardData.types).includes("Files")) {
    testClipboardData.files = testClipboardData.items
  }

  triggerInputEvent(document.activeElement, "beforeinput", { inputType: "insertFromPaste", dataTransfer: testClipboardData })
  triggerEvent(document.activeElement, "paste", { testClipboardData })
  if (callback) { return requestAnimationFrame(callback) }
}

export var createFile = function(properties = {}) {
  const file = { getAsFile() { return {} } }
  for (const key in properties) { const value = properties[key]; file[key] = value }
  return file
}

export var typeCharacters = function(string, callback) {
  let characters, typeNextCharacter
  if (Array.isArray(string)) {
    characters = string
  } else {
    characters = string.split("")
  }

  return (typeNextCharacter = () => defer(function() {
    const character = characters.shift()
    if (character != null) {
      switch (character) {
        case "\n":
          return pressKey("return", typeNextCharacter)
        case "\b":
          return pressKey("backspace", typeNextCharacter)
        default:
          return typeCharacterInElement(character, document.activeElement, typeNextCharacter)
      }
    } else {
      return callback()
    }
  }))()
}

export var pressKey = function(keyName, callback) {
  const element = document.activeElement
  code = keyCodes[keyName]
  const properties = { which: code, keyCode: code, charCode: 0, key: capitalize(keyName) }

  if (!triggerEvent(element, "keydown", properties)) { return callback() }

  return simulateKeypress(keyName, () => defer(function() {
    triggerEvent(element, "keyup", properties)
    return defer(callback)
  }))
}

export var startComposition = function(data, callback) {
  const element = document.activeElement
  triggerEvent(element, "compositionstart", { data: "" })
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })
  triggerEvent(element, "input")

  const node = document.createTextNode(data)
  insertNode(node)
  return selectNode(node, callback)
}

export var updateComposition = function(data, callback) {
  const element = document.activeElement
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })
  triggerEvent(element, "input")

  const node = document.createTextNode(data)
  insertNode(node)
  return selectNode(node, callback)
}

export var endComposition = function(data, callback) {
  const element = document.activeElement
  triggerInputEvent(element, "beforeinput", { inputType: "insertCompositionText", data })
  triggerEvent(element, "compositionupdate", { data })

  const node = document.createTextNode(data)
  insertNode(node)
  selectNode(node)
  return collapseSelection("right", function() {
    triggerEvent(element, "input")
    triggerEvent(element, "compositionend", { data })
    return requestAnimationFrame(callback)
  })
}

export var clickElement = function(element, callback) {
  if (triggerEvent(element, "mousedown")) {
    return defer(function() {
      if (triggerEvent(element, "mouseup")) {
        return defer(function() {
          triggerEvent(element, "click")
          return defer(callback)
        })
      }
    })
  }
}

export var dragToCoordinates = function(coordinates, callback) {
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
    }
  }

  triggerEvent(element, "mousemove")

  const dragstartData = { dataTransfer }
  triggerEvent(element, "dragstart", dragstartData)
  triggerInputEvent(element, "beforeinput", { inputType: "deleteByDrag" })

  const dropData = { dataTransfer }
  for (const key in coordinates) { const value = coordinates[key]; dropData[key] = value }
  triggerEvent(element, "drop", dropData)

  const { clientX, clientY } = coordinates
  const domRange = createDOMRangeFromPoint(clientX, clientY)
  triggerInputEvent(element, "beforeinput", { inputType: "insertFromDrop", ranges: [ domRange ] })

  return defer(callback)
}

export var mouseDownOnElementAndMove = function(element, distance, callback) {
  const coordinates = getElementCoordinates(element)
  triggerEvent(element, "mousedown", coordinates)

  const destination = offset => ({
    clientX: coordinates.clientX + offset,
    clientY: coordinates.clientY + offset
  })

  const dragSpeed = 20

  return after(dragSpeed, function() {
    let drag
    let offset = 0
    return (drag = () => {
      if (++offset <= distance) {
        triggerEvent(element, "mousemove", destination(offset))
        return after(dragSpeed, drag)
      } else {
        triggerEvent(element, "mouseup", destination(distance))
        return after(dragSpeed, callback)
      }
    })()
  })
}

var typeCharacterInElement = function(character, element, callback) {
  const charCode = character.charCodeAt(0)
  const keyCode = character.toUpperCase().charCodeAt(0)

  if (!triggerEvent(element, "keydown", { keyCode, charCode: 0 })) { return callback() }

  return defer(function() {
    if (!triggerEvent(element, "keypress", { keyCode: charCode, charCode })) { return callback() }
    triggerInputEvent(element, "beforeinput", { inputType: "insertText", data: character })
    return insertCharacter(character, function() {
      triggerEvent(element, "input")

      return defer(function() {
        triggerEvent(element, "keyup", { keyCode, charCode: 0 })
        return callback()
      })
    })
  })
}

var insertCharacter = function(character, callback) {
  const node = document.createTextNode(character)
  return insertNode(node, callback)
}

var simulateKeypress = function(keyName, callback) {
  switch (keyName) {
    case "backspace":
      return deleteInDirection("left", callback)
    case "delete":
      return deleteInDirection("right", callback)
    case "return":
      return defer(function() {
        triggerInputEvent(document.activeElement, "beforeinput", { inputType: "insertParagraph" })
        const node = document.createElement("br")
        return insertNode(node, callback)
      })
  }
}

var deleteInDirection = function(direction, callback) {
  if (selectionIsCollapsed()) {
    getComposition().expandSelectionInDirection(direction === "left" ? "backward" : "forward")
    return defer(function() {
      const inputType = direction === "left" ? "deleteContentBackward" : "deleteContentForward"
      triggerInputEvent(document.activeElement, "beforeinput", { inputType })
      return defer(function() {
        deleteSelection()
        return callback()
      })
    })
  } else {
    triggerInputEvent(document.activeElement, "beforeinput", { inputType: "deleteContentBackward" })
    deleteSelection()
    return callback()
  }
}

var getElementCoordinates = function(element) {
  const rect = element.getBoundingClientRect()
  return {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2
  }
}

var capitalize = string => string.charAt(0).toUpperCase() + string.slice(1)
