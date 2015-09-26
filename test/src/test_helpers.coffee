#= require trix/core/helpers/global

{normalizeRange, rangesAreEqual} = Trix

@TEST_IMAGE_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="

initialized = false
initializedCallbacks = []

document.addEventListener "trix-initialize", ->
  initialized = true
  callback() while callback = initializedCallbacks.shift()

editorInitialized = (callback) ->
  if initialized
    callback()
  else
    initializedCallbacks.push(callback)

keyCodes = {}
for code, name of Trix.InputController.keyNames
  keyCodes[name] = code

@after = (defer, callback) ->
  setTimeout(callback, defer)

@defer = (callback) -> after 1, callback

@editorModule = (name, {template, setup, teardown, config, delegate} = {}) ->
  module name,

    setup: ->
      initialized = false
      if template?
        document.getElementById("trix-container").innerHTML = JST["fixtures/#{template}"]()
      setup?()

    teardown: ->
      if template?
        document.getElementById("trix-container").innerHTML = ""
      teardown?()

@editorTest = (name, callback) ->
  done = (expectedDocumentValue) ->
    if expectedDocumentValue
      equal getDocument().toString(), expectedDocumentValue
    QUnit.start()

  asyncTest name, ->
    editorInitialized ->
      prepareEditor()
      if callback.length is 0
        callback()
        done()
      else
        callback done

@assertLocationRange = (start, end) ->
  expectedLocationRange = normalizeRange([start, end])
  actualLocationRange = getEditorController().getLocationRange()
  ok rangesAreEqual(expectedLocationRange, actualLocationRange)

@pasteContent = (contentType, value, callback) ->
  testClipboardData =
    getData: (type) ->
      value if type is contentType
    types: [contentType]
    items: [value]

  triggerEvent(document.activeElement, "paste", {testClipboardData})
  defer callback

@createFile = (properties = {}) ->
  file = getAsFile: -> {}
  file[key] = value for key, value of properties
  file

@typeCharacters = (string, callback) ->
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

@pressKey = (keyName, callback) ->
  element = document.activeElement
  code = keyCodes[keyName]
  properties = which: code, keyCode: code, charCode: 0

  return callback() unless triggerEvent(element, "keydown", properties)

  simulateKeypress keyName, ->
    defer ->
      triggerEvent(element, "keyup", properties)
      defer(callback)

@composeString = (string, callback) ->
  index = 1
  started = false
  updated = false

  do continueComposition = -> defer ->
    if started
      if updated and index >= string.length
        compose string, "end", ->
          node = document.createTextNode(string)
          insertNode(node, callback)
      else
        updated = true
        compose(string.slice(0, index++), "update", continueComposition)
    else
      started = true
      compose(string.slice(0, index++), "start", continueComposition)

@insertString = (string) ->
  getComposition().insertString(string)
  render()

@insertText = (text) ->
  getComposition().insertText(text)
  render()

@insertDocument = (document) ->
  getComposition().insertDocument(document)
  render()

@insertFile = (file) ->
  getComposition().insertFile(file)
  render()

@insertImageAttachment = (attributes) ->
  attributes ?=
    url: TEST_IMAGE_URL
    width: 10
    height: 10
    filename: "image.gif"
    contentType: "image/gif"

  attachment = new Trix.Attachment attributes
  text = Trix.Text.textForAttachmentWithAttributes(attachment)
  insertText(text)

@replaceDocument = (document) ->
  getComposition().setDocument(document)
  render()

prepareEditor = ->
  if getEditorElement().hasAttribute("autofocus")
    getEditorController().setLocationRange(index: 0, offset: 0)

render = ->
  getEditorController().render()

typeCharacterInElement = (character, element, callback) ->
  charCode = character.charCodeAt(0)
  keyCode = character.toUpperCase().charCodeAt(0)

  return callback() unless triggerEvent(element, "keydown", keyCode: keyCode, charCode: 0)

  defer ->
    return callback() unless triggerEvent(element, "keypress", keyCode: charCode, charCode: charCode)
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
      node = document.createElement("br")
      insertNode(node, callback)

compose = (string, name, callback) ->
  element = document.activeElement
  triggerEvent(element, "keydown", which: 229, keyCode: 229, charCode: 0)
  defer ->
    triggerEvent(element, "composition#{name}", data: string)
    defer ->
      triggerEvent(element, "input")
      defer(callback)

deleteInDirection = (direction, callback) ->
  if getDOMRange()?.collapsed
    expandSelection direction, ->
      deleteSelection()
      callback()
  else
    deleteSelection()
    callback()

deleteSelection = ->
  getDOMRange()?.deleteContents()

insertNode = (node, callback) ->
  deleteSelection()
  getDOMRange()?.insertNode(node)

  domRange = document.createRange()
  domRange.selectNode(node)
  domRange.collapse(false)
  setDOMRange(domRange)
  callback?()

getDOMRange = ->
  selection = window.getSelection()
  if selection.rangeCount
    selection.getRangeAt(0)

setDOMRange = (domRange) ->
  selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(domRange)

@createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

@triggerEvent = (element, type, properties) ->
  element.dispatchEvent(createEvent(type, properties))

@clickElement = (element, callback) ->
  if triggerEvent(element, "mousedown")
    defer ->
      if triggerEvent(element, "mouseup")
        defer ->
          triggerEvent(element, "click")
          defer(callback)

@moveCursor = (options, callback) ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  times ?= 1

  do move = -> defer ->
    if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction])
      selection = window.getSelection()
      if selection.modify
        selection.modify("move", direction, "character")
      else if document.body.createTextRange
        textRange = document.body.createTextRange()
        coordinates = getCursorCoordinates()
        textRange.moveToPoint(coordinates.clientX, coordinates.clientY)
        textRange.move("character", if direction is "right" then 1 else -1)
        textRange.select()
      Trix.selectionChangeObserver.update()

    if --times is 0
      defer -> callback(getCursorCoordinates())
    else
      move()

getCursorCoordinates = ->
  if rect = window.getSelection().getRangeAt(0).getClientRects()[0]
    clientX: rect.left
    clientY: rect.top + rect.height / 2

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2

@expandSelection = (options, callback) -> defer ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  times ?= 1

  do expand = -> defer ->
    if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction], shiftKey: true)
      getComposition().expandSelectionInDirection(if direction is "left" then "backward" else "forward")

    if --times is 0
      defer(callback)
    else
      expand()

@collapseSelection = (direction, callback) ->
  selection = window.getSelection()
  domRange = selection.getRangeAt(0)
  newDOMRange = document.createRange()
  if direction is "left"
    newDOMRange.setStart(domRange.startContainer, domRange.startOffset)
  else
    newDOMRange.setStart(domRange.endContainer, domRange.endOffset)
  selection.removeAllRanges()
  selection.addRange(newDOMRange)
  Trix.selectionChangeObserver.update()
  defer(callback)

@selectAll = (callback) ->
  window.getSelection().selectAllChildren(document.activeElement)
  Trix.selectionChangeObserver.update()
  defer(callback)

@dragToCoordinates = (coordinates, callback) ->
  element = document.activeElement
  triggerEvent(element, "mousemove")
  triggerEvent(element, "dragstart")
  triggerEvent(element, "drop", coordinates)
  defer(callback)

@mouseDownOnElementAndMove = (element, distance, callback) ->
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
