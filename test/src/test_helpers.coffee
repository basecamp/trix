{defer} = Trix.Helpers

@after = (delay, callback) ->
  setTimeout(callback, delay)

@editorModule = (name, {template, setup, teardown, config} = {}) ->
  module name,

    setup: ->
      if template?
        document.body.insertAdjacentHTML("beforeend", JST["fixtures/#{template}"]())
        delegate = shouldAcceptFile: -> true
        editorConfig = toolbar: "toolbar", textarea: "content", delegate: delegate
        editorConfig[key] = value for key, value of config if config?
        window.editor = Trix.install(editorConfig)
        getEditorElement().focus()
        Trix.selectionChangeObserver.update()
      setup?()

    teardown: ->
      if template?
        document.body.removeChild(document.getElementById("container"))
        window.editor = null
      teardown?()

@testEditorManipulation = (name, callback) ->
  expectDocument = (expectedValue) ->
    equal editor.document.toString(), expectedValue
    QUnit.start()

  asyncTest name, ->
    expect 1
    defer ->
      callback expectDocument

@getEditorElement = ->
  document.querySelector("div.trix-editor[contenteditable]")

@pasteContent = (contentType, value, callback) ->
  testClipboardData =
    getData: (type) ->
      value if type is contentType
    types: [contentType]
    items: [value]

  event = createEvent("paste", {testClipboardData})
  document.activeElement.dispatchEvent(event)
  defer callback

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

  keydownEvent = createEvent("keydown", keyCode: keyCode, charCode: 0)
  return callback() unless element.dispatchEvent(keydownEvent)

  defer ->
    keypressEvent = createEvent("keypress", keyCode: charCode, charCode: charCode)
    return callback() unless element.dispatchEvent(keypressEvent)

    inputEvent = createEvent("input")
    element.dispatchEvent(inputEvent)

    defer ->
      keyupEvent = createEvent("keyup", keyCode: keyCode, charCode: 0)
      element.dispatchEvent(keyupEvent)
      callback()

@createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

@moveCursor = (options, callback) ->
  selection = window.getSelection()

  if typeof options is "string"
    direction = options
  else
    direction = options.direction
    times = options.times

  for i in [0...(times ? 1)]
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

getCursorCoordinates = ->
  rect = window.getSelection().getRangeAt(0).getClientRects()[0]
  clientX: rect.left
  clientY: rect.top + rect.height / 2

@selectInDirection = (direction, callback) ->
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
  document.activeElement.dispatchEvent(createEvent("dragstart"))
  dropEvent = createEvent("drop", coordinates)
  document.activeElement.dispatchEvent(dropEvent)
  defer(callback)
