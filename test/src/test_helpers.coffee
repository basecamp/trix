{defer} = Trix.Helpers

keyCodes =
  left: 37
  right: 39

@after = (delay, callback) ->
  setTimeout(callback, delay)

@editorModule = (name, {template, setup, teardown, config, delegate} = {}) ->
  module name,

    setup: ->
      if template?
        document.body.insertAdjacentHTML("beforeend", JST["fixtures/#{template}"]())
        delegate ?= shouldAcceptFile: -> true
        editorConfig = toolbar: "toolbar", textarea: "content", delegate: delegate
        editorConfig[key] = value for key, value of config if config?
        window.editor = Trix.install(editorConfig)
      setup?()

    teardown: ->
      if template?
        document.body.removeChild(document.getElementById("container"))
        window.editor = null
      teardown?()

@editorTest = (name, callback) ->
  done = (expectedDocumentValue) ->
    if expectedDocumentValue
      equal editor.document.toString(), expectedDocumentValue
    QUnit.start()

  asyncTest name, ->
    defer ->
      callback done

@assertLocationRange = (start, end) ->
  expectedLocationRange = new Trix.LocationRange start, end
  actualLocationRange = editor.selectionManager.getLocationRange()
  equal actualLocationRange.inspect(), expectedLocationRange.inspect()

@getEditorElement = ->
  document.querySelector("div.trix-editor[contenteditable]")

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
  characters = string.split("")
  do typeNextCharacter = ->
    character = characters.shift()
    if character?
      typeCharacterInElement(character, document.activeElement, typeNextCharacter)
    else
      callback()

typeCharacterInElement = (character, element, callback) ->
  charCode = character.charCodeAt(0)
  keyCode = character.toUpperCase().charCodeAt(0)

  return callback() unless triggerEvent(element, "keydown", keyCode: keyCode, charCode: 0)

  defer ->
    return callback() unless triggerEvent(element, "keypress", keyCode: charCode, charCode: charCode)
    triggerEvent(element, "input")

    defer ->
      triggerEvent(element, "keyup", keyCode: keyCode, charCode: 0)
      callback()

@createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

@triggerEvent = (element, type, properties) ->
  element.dispatchEvent(createEvent(type, properties))

@clickElement = (element, callback) ->
  triggerEvent(element, "click")
  defer(callback)

@moveCursor = (options, callback) ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  getEditorElement().focus()

  for i in [0...(times ? 1)]
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

  defer ->
    callback getCursorCoordinates()

@moveCursorToBeginning = (callback) ->
  range = document.createRange()
  range.setStart(document.activeElement, 0)
  selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  Trix.selectionChangeObserver.update()
  defer ->
    callback getCursorCoordinates()

getCursorCoordinates = ->
  if rect = window.getSelection().getRangeAt(0).getClientRects()[0]
    clientX: rect.left
    clientY: rect.top + rect.height / 2

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2

@selectInDirection = (direction, callback) ->
  getEditorElement().focus()
  if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction], shiftKey: true)
    selection = window.getSelection()
    if selection.modify
      selection.modify("extend", direction, "character")
    else if document.body.createTextRange
      textRange = document.body.createTextRange()
      coordinates = getCursorCoordinates()
      textRange.moveToPoint(coordinates.clientX, coordinates.clientY)
      if direction is "left"
        textRange.moveStart("character", -1)
      else
        textRange.moveEnd("character", 1)
      textRange.select()
    Trix.selectionChangeObserver.update()
  defer(callback)

@selectAll = (callback) ->
  window.getSelection().selectAllChildren(document.activeElement)
  Trix.selectionChangeObserver.update()
  defer(callback)

@dragToCoordinates = (coordinates, callback) ->
  element = document.activeElement
  triggerEvent(element, "dragstart")
  triggerEvent(element, "drop", coordinates)
  defer(callback)

@mouseDownOnElementAndMove = (element, distance, callback) ->
  coordinates = getElementCoordinates(element)
  triggerEvent(element, "mousedown", coordinates)

  destination = (offset) ->
    clientX: coordinates.clientX + offset
    clientY: coordinates.clientY + offset

  defer ->
    offset = 0
    do drag = =>
      if ++offset <= distance
        triggerEvent(element, "mousemove", destination(offset))
        defer(drag)
      else
        triggerEvent(element, "mouseup", destination(distance))
        defer(callback)
