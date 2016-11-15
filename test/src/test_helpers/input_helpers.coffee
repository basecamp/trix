helpers = Trix.TestHelpers

keyCodes = {}
for code, name of Trix.InputController.keyNames
  keyCodes[name] = code

helpers.extend
  createEvent: (type, properties = {}) ->
    event = document.createEvent("Events")
    event.initEvent(type, true, true)
    for key, value of properties
      event[key] = value
    event

  triggerEvent: (element, type, properties) ->
    element.dispatchEvent(helpers.createEvent(type, properties))

  pasteContent: (contentType, value, callback) ->
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

    helpers.triggerEvent(document.activeElement, "paste", {testClipboardData})
    helpers.defer callback

  createFile: (properties = {}) ->
    file = getAsFile: -> {}
    file[key] = value for key, value of properties
    file

  typeCharacters: (string, callback) ->
    if Array.isArray(string)
      characters = string
    else
      characters = string.split("")

    do typeNextCharacter = -> helpers.defer ->
      character = characters.shift()
      if character?
        switch character
          when "\n"
            helpers.pressKey("return", typeNextCharacter)
          when "\b"
            helpers.pressKey("backspace", typeNextCharacter)
          else
            typeCharacterInElement(character, document.activeElement, typeNextCharacter)
      else
        callback()

  pressKey: (keyName, callback) ->
    element = document.activeElement
    code = keyCodes[keyName]
    properties = which: code, keyCode: code, charCode: 0

    return callback() unless helpers.triggerEvent(element, "keydown", properties)

    simulateKeypress keyName, ->
      helpers.defer ->
        helpers.triggerEvent(element, "keyup", properties)
        helpers.defer(callback)

  startComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerEvent(element, "compositionstart", data: "")
    helpers.triggerEvent(element, "compositionupdate", data: data)
    helpers.triggerEvent(element, "input")

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node, callback)

  updateComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerEvent(element, "compositionupdate", data: data)
    helpers.triggerEvent(element, "input")

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node, callback)

  endComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerEvent(element, "compositionupdate", data: data)

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node)
    helpers.collapseSelection "right", ->
      helpers.triggerEvent(element, "input")
      helpers.triggerEvent(element, "compositionend", data: data)
      helpers.defer(callback)

  clickElement: (element, callback) ->
    if helpers.triggerEvent(element, "mousedown")
      helpers.defer ->
        if helpers.triggerEvent(element, "mouseup")
          helpers.defer ->
            helpers.triggerEvent(element, "click")
            helpers.defer(callback)

  dragToCoordinates: (coordinates, callback) ->
    element = document.activeElement

    dropData = dataTransfer: files: []
    dropData[key] = value for key, value of coordinates

    helpers.triggerEvent(element, "mousemove")
    helpers.triggerEvent(element, "dragstart")
    helpers.triggerEvent(element, "drop", dropData)

    helpers.defer(callback)

  mouseDownOnElementAndMove: (element, distance, callback) ->
    coordinates = getElementCoordinates(element)
    helpers.triggerEvent(element, "mousedown", coordinates)

    destination = (offset) ->
      clientX: coordinates.clientX + offset
      clientY: coordinates.clientY + offset

    dragSpeed = 20

    after dragSpeed, ->
      offset = 0
      do drag = =>
        if ++offset <= distance
          helpers.triggerEvent(element, "mousemove", destination(offset))
          after(dragSpeed, drag)
        else
          helpers.triggerEvent(element, "mouseup", destination(distance))
          after(dragSpeed, callback)

typeCharacterInElement = (character, element, callback) ->
  charCode = character.charCodeAt(0)
  keyCode = character.toUpperCase().charCodeAt(0)

  return callback() unless helpers.triggerEvent(element, "keydown", keyCode: keyCode, charCode: 0)

  helpers.defer ->
    return callback() unless helpers.triggerEvent(element, "keypress", keyCode: charCode, charCode: charCode)
    insertCharacter character, ->
      helpers.triggerEvent(element, "input")

      helpers.defer ->
        helpers.triggerEvent(element, "keyup", keyCode: keyCode, charCode: 0)
        callback()

insertCharacter = (character, callback) ->
  node = document.createTextNode(character)
  helpers.insertNode(node, callback)

simulateKeypress = (keyName, callback) ->
  switch keyName
    when "backspace"
      deleteInDirection("left", callback)
    when "delete"
      deleteInDirection("right", callback)
    when "return"
      node = document.createElement("br")
      helpers.insertNode(node, callback)

deleteInDirection = (direction, callback) ->
  if helpers.selectionIsCollapsed()
    getComposition().expandSelectionInDirection(if direction is "left" then "backward" else "forward")
    helpers.defer ->
      helpers.deleteSelection()
      callback()
  else
    helpers.deleteSelection()
    callback()

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2
