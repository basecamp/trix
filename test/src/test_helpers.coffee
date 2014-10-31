{defer} = Trix.Helpers

@editorModule = (name, {template, setup, teardown, config} = {}) ->
  module name,

    setup: ->
      if template?
        document.body.insertAdjacentHTML("beforeend", JST["fixtures/#{template}"]())
        editorConfig = toolbar: "toolbar", textarea: "content"
        editorConfig[key] = value for key, value of config if config?
        window.editor = Trix.install(editorConfig)
        getEditorElement().focus()
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

createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

@moveCursor = (direction, callback) ->
  document.activeElement.dispatchEvent(createEvent("mousedown"))
  selection = window.getSelection()
  if selection.modify
    selection.modify("move", direction, "character")
  else if document.body.createTextRange
    rects = selection.getRangeAt(0).getClientRects()
    rect = rects[rects.length - 1]
    textRange = document.body.createTextRange()
    textRange.moveToPoint(rect.right, rect.top)
    textRange.move("character", if direction is "right" then 1 else -1)
    textRange.select()
  document.activeElement.dispatchEvent(createEvent("mouseup"))
  defer(callback)

@selectAll = (callback) ->
  document.activeElement.dispatchEvent(createEvent("mousedown"))
  window.getSelection().selectAllChildren(document.activeElement)
  document.activeElement.dispatchEvent(createEvent("mouseup"))
  defer(callback)
