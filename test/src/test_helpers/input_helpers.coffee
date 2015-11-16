keyCodes = {}
for code, name of Trix.InputController.keyNames
  keyCodes[name] = code

@createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    event[key] = value
  event

@triggerEvent = (element, type, properties) ->
  element.dispatchEvent(createEvent(type, properties))

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
        # The cursor doesn't acually move like this during a composition, but
        # it can move and cause the location range and current attributes to change.
        # Moving the cursor and then putting it back is enough exercise those changes.
        moveCursor "left", ->
          moveCursor "right", ->
            compose(string.slice(0, index++), "update", continueComposition)
    else
      started = true
      compose(string.slice(0, index++), "start", continueComposition)

@clickElement = (element, callback) ->
  if triggerEvent(element, "mousedown")
    defer ->
      if triggerEvent(element, "mouseup")
        defer ->
          triggerEvent(element, "click")
          defer(callback)

@dragToCoordinates = (coordinates, callback) ->
  element = document.activeElement

  dropData = dataTransfer: files: []
  dropData[key] = value for key, value of coordinates

  triggerEvent(element, "mousemove")
  triggerEvent(element, "dragstart")
  triggerEvent(element, "drop", dropData)

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

compose = (string, name, callback) ->
  element = document.activeElement
  triggerEvent(element, "keydown", which: 229, keyCode: 229, charCode: 0)
  defer ->
    triggerEvent(element, "composition#{name}", data: string)
    defer ->
      triggerEvent(element, "input")
      defer(callback)

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

deleteInDirection = (direction, callback) ->
  if selectionIsCollapsed()
    expandSelection direction, ->
      deleteSelection()
      callback()
  else
    deleteSelection()
    callback()

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2
