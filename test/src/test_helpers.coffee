keyCodes =
  left: 37
  right: 39

@after = (defer, callback) ->
  setTimeout(callback, defer)

@defer = (callback) -> after 1, callback

@editorModule = (name, {template, setup, teardown, config, delegate} = {}) ->
  module name,

    setup: ->
      if template?
        document.getElementById("trix_container").innerHTML = JST["fixtures/#{template}"]()
        delegate ?= shouldAcceptFile: -> true
        editorConfig = toolbar: "toolbar", textarea: "content", delegate: delegate
        editorConfig[key] = value for key, value of config if config?
        window.editor = Trix.install(editorConfig)
      setup?()

    teardown: ->
      if template?
        document.getElementById("trix_container").innerHTML = ""
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
  do typeNextCharacter = -> defer ->
    character = characters.shift()
    if character?
      character = "\r" if character is "\n"
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

@clickElement = (element, callback) -> defer ->
  if triggerEvent(element, "mousedown")
    if triggerEvent(element, "mouseup")
      triggerEvent(element, "click")
      defer(callback)

@moveCursor = (options, callback) ->
  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  times ?= 1
  getEditorElement().focus()

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
      callback(getCursorCoordinates())
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
  getEditorElement().focus()

  do expand = -> defer ->
    if triggerEvent(document.activeElement, "keydown", keyCode: keyCodes[direction], shiftKey: true)
      editor.composition.expandSelectionInDirection(if direction is "left" then "backward" else "forward")

    if --times is 0
      callback()
    else
      expand()

@collapseSelection = (direction, callback) ->
  selection = window.getSelection()
  range = selection.getRangeAt(0)
  newRange = document.createRange()
  if direction is "left"
    newRange.setStart(range.startContainer, range.startOffset)
  else
    newRange.setStart(range.endContainer, range.endOffset)
  selection.removeAllRanges()
  selection.addRange(newRange)
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
