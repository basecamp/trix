import config from "trix/config"
import { defer } from "./functions"
import { createEvent, triggerEvent } from "./event_helpers"
import { selectionIsCollapsed, deleteSelection, insertNode, createDOMRangeFromPoint,
  selectNode, collapseSelection } from "./selection_helpers"

keyCodes = {}
for code, name of config.keyNames
  keyCodes[name] = code

isIE = /Windows.*Trident/.test(navigator.userAgent)

export triggerInputEvent = (element, type, properties = {}) ->
  if config.input.getLevel() is 2
    if properties.ranges
      ranges = properties.ranges
      delete properties.ranges
    else
      ranges = []
      selection = window.getSelection()
      if selection.rangeCount > 0
        ranges.push(selection.getRangeAt(0).cloneRange())
    properties.getTargetRanges = -> ranges
    triggerEvent(element, type, properties)

export pasteContent = (contentType, value, callback) ->
  if typeof contentType is "object"
    data = contentType
    callback = value
  else
    data = "#{contentType}": value

  testClipboardData =
    getData: (type) ->
      data[type]
    types: (key for key of data)
    items: (value for key, value of data)

  if "Files" in testClipboardData.types
    testClipboardData.files = testClipboardData.items

  triggerInputEvent(document.activeElement, "beforeinput", inputType: "insertFromPaste", dataTransfer: testClipboardData)
  triggerEvent(document.activeElement, "paste", {testClipboardData})
  requestAnimationFrame(callback) if callback

export createFile = (properties = {}) ->
  file = getAsFile: -> {}
  file[key] = value for key, value of properties
  file

export typeCharacters = (string, callback) ->
  if Array.isArray(string)
    characters = string
  else
    characters = string.split("")

  do typeNextCharacter = -> defer ->
    character = characters.shift()
    if character?
      switch character
        when "\n"
          pressKey("return", typeNextCharacter)
        when "\b"
          pressKey("backspace", typeNextCharacter)
        else
          typeCharacterInElement(character, document.activeElement, typeNextCharacter)
    else
      callback()

export pressKey = (keyName, callback) ->
  element = document.activeElement
  code = keyCodes[keyName]
  properties = which: code, keyCode: code, charCode: 0, key: capitalize(keyName)

  return callback() unless triggerEvent(element, "keydown", properties)

  simulateKeypress keyName, ->
    defer ->
      triggerEvent(element, "keyup", properties)
      defer(callback)

export startComposition = (data, callback) ->
  element = document.activeElement
  triggerEvent(element, "compositionstart", data: "")
  triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
  triggerEvent(element, "compositionupdate", data: data)
  triggerEvent(element, "input")

  node = document.createTextNode(data)
  insertNode(node)
  selectNode(node, callback)

export updateComposition = (data, callback) ->
  element = document.activeElement
  triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
  triggerEvent(element, "compositionupdate", data: data)
  triggerEvent(element, "input")

  node = document.createTextNode(data)
  insertNode(node)
  selectNode(node, callback)

export endComposition = (data, callback) ->
  element = document.activeElement
  triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
  triggerEvent(element, "compositionupdate", data: data)

  node = document.createTextNode(data)
  insertNode(node)
  selectNode(node)
  collapseSelection "right", ->
    triggerEvent(element, "input")
    triggerEvent(element, "compositionend", data: data)
    requestAnimationFrame(callback)

export clickElement = (element, callback) ->
  if triggerEvent(element, "mousedown")
    defer ->
      if triggerEvent(element, "mouseup")
        defer ->
          triggerEvent(element, "click")
          defer(callback)

export dragToCoordinates = (coordinates, callback) ->
  element = document.activeElement

  # IE only allows writing "text" to DataTransfer
  # https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
  dataTransfer =
    files: []
    data: {}
    getData: (format) ->
      if isIE and format.toLowerCase() isnt "text"
        throw new Error "Invalid argument."
      else
        @data[format]
        true
    setData: (format, data) ->
      if isIE and format.toLowerCase() isnt "text"
        throw new Error "Unexpected call to method or property access."
      else
        @data[format] = data

  triggerEvent(element, "mousemove")

  dragstartData = {dataTransfer}
  triggerEvent(element, "dragstart", dragstartData)
  triggerInputEvent(element, "beforeinput", inputType: "deleteByDrag")

  dropData = {dataTransfer}
  dropData[key] = value for key, value of coordinates
  triggerEvent(element, "drop", dropData)

  {clientX, clientY} = coordinates
  domRange = createDOMRangeFromPoint(clientX, clientY)
  triggerInputEvent(element, "beforeinput", inputType: "insertFromDrop", ranges: [domRange])

  defer(callback)

export mouseDownOnElementAndMove = (element, distance, callback) ->
  coordinates = getElementCoordinates(element)
  triggerEvent(element, "mousedown", coordinates)

  destination = (offset) ->
    clientX: coordinates.clientX + offset
    clientY: coordinates.clientY + offset

  dragSpeed = 20

  after dragSpeed, ->
    offset = 0
    do drag = =>
      if ++offset <= distance
        triggerEvent(element, "mousemove", destination(offset))
        after(dragSpeed, drag)
      else
        triggerEvent(element, "mouseup", destination(distance))
        after(dragSpeed, callback)

typeCharacterInElement = (character, element, callback) ->
  charCode = character.charCodeAt(0)
  keyCode = character.toUpperCase().charCodeAt(0)

  return callback() unless triggerEvent(element, "keydown", keyCode: keyCode, charCode: 0)

  defer ->
    return callback() unless triggerEvent(element, "keypress", keyCode: charCode, charCode: charCode)
    triggerInputEvent(element, "beforeinput", inputType: "insertText", data: character)
    insertCharacter character, ->
      triggerEvent(element, "input")

      defer ->
        triggerEvent(element, "keyup", keyCode: keyCode, charCode: 0)
        callback()

insertCharacter = (character, callback) ->
  node = document.createTextNode(character)
  insertNode(node, callback)

simulateKeypress = (keyName, callback) ->
  switch keyName
    when "backspace"
      deleteInDirection("left", callback)
    when "delete"
      deleteInDirection("right", callback)
    when "return"
      defer ->
        triggerInputEvent(document.activeElement, "beforeinput", inputType: "insertParagraph")
        node = document.createElement("br")
        insertNode(node, callback)

deleteInDirection = (direction, callback) ->
  if selectionIsCollapsed()
    getComposition().expandSelectionInDirection(if direction is "left" then "backward" else "forward")
    defer ->
      inputType = if direction is "left" then "deleteContentBackward" else "deleteContentForward"
      triggerInputEvent(document.activeElement, "beforeinput", {inputType})
      defer ->
        deleteSelection()
        callback()
  else
    triggerInputEvent(document.activeElement, "beforeinput", inputType: "deleteContentBackward")
    deleteSelection()
    callback()

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2

capitalize = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)
