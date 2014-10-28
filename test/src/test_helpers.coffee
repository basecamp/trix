{defer} = Trix.Helpers

@editorModule = (name, {template, setup, teardown} = {}) ->
  module name,
    setup: ->
      if template?
        document.body.insertAdjacentHTML("beforeend", JST["fixtures/#{template}"]())
        window.editor = Trix.install(toolbar: "toolbar", textarea: "content")
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

getEditorElement = ->
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
  element.dispatchEvent(keydownEvent)
  return callback() if keydownEvent.defaultPrevented

  defer ->
    keypressEvent = createEvent("keypress", keyCode: charCode, charCode: charCode)
    element.dispatchEvent(keypressEvent)
    return callback() if keypressEvent.defaultPrevented

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
  selection = window.getSelection()
  selection.modify("move", direction, "character")
  defer(callback)

@selectAll = (callback) ->
  window.getSelection().selectAllChildren(document.activeElement)
  defer(callback)
