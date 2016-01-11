keyCodes = {}
for code, name of Trix.InputController.keyNames
  keyCodes[name] = code

trix.extend
  createEvent: (type, properties = {}) ->
    event = document.createEvent("Events")
    event.initEvent(type, true, true)
    for key, value of properties
      event[key] = value
    event

  triggerEvent: (element, type, properties) ->
    element.dispatchEvent(trix.createEvent(type, properties))

  pasteContent: (contentType, value, callback) ->
    testClipboardData =
      getData: (type) ->
        value if type is contentType
      types: [contentType]
      items: [value]

    trix.triggerEvent(document.activeElement, "paste", {testClipboardData})
    trix.defer callback

  createFile: (properties = {}) ->
    file = getAsFile: -> {}
    file[key] = value for key, value of properties
    file

  typeCharacters: (string, callback) ->
    if Array.isArray(string)
      characters = string
    else
      characters = string.split("")

    do typeNextCharacter = -> trix.defer ->
      character = characters.shift()
      if character?
        switch character
          when "\n"
            trix.pressKey("return", typeNextCharacter)
          when "\b"
            trix.pressKey("backspace", typeNextCharacter)
          else
            typeCharacterInElement(character, document.activeElement, typeNextCharacter)
      else
        callback()

  pressKey: (keyName, callback) ->
    element = document.activeElement
    code = keyCodes[keyName]
    properties = which: code, keyCode: code, charCode: 0

    return callback() unless trix.triggerEvent(element, "keydown", properties)

    simulateKeypress keyName, ->
      trix.defer ->
        trix.triggerEvent(element, "keyup", properties)
        trix.defer(callback)

  startComposition: (data, callback) ->
    element = document.activeElement
    trix.triggerEvent(element, "compositionstart", data: "")
    trix.triggerEvent(element, "compositionupdate", data: data)
    trix.triggerEvent(element, "input")

    node = document.createTextNode(data)
    trix.insertNode(node)
    trix.selectNode(node, callback)

  updateComposition: (data, callback) ->
    element = document.activeElement
    trix.triggerEvent(element, "compositionupdate", data: data)
    trix.triggerEvent(element, "input")

    node = document.createTextNode(data)
    trix.insertNode(node)
    trix.selectNode(node, callback)

  endComposition: (data, callback) ->
    element = document.activeElement
    trix.triggerEvent(element, "compositionupdate", data: data)
    trix.triggerEvent(element, "input")
    trix.triggerEvent(element, "compositionend", data: data)
    trix.triggerEvent(element, "input")

    node = document.createTextNode(data)
    trix.insertNode(node)
    trix.selectNode(node)
    trix.collapseSelection("right", callback)

  clickElement: (element, callback) ->
    if trix.triggerEvent(element, "mousedown")
      trix.defer ->
        if trix.triggerEvent(element, "mouseup")
          trix.defer ->
            trix.triggerEvent(element, "click")
            trix.defer(callback)

  dragToCoordinates: (coordinates, callback) ->
    element = document.activeElement

    dropData = dataTransfer: files: []
    dropData[key] = value for key, value of coordinates

    trix.triggerEvent(element, "mousemove")
    trix.triggerEvent(element, "dragstart")
    trix.triggerEvent(element, "drop", dropData)

    trix.defer(callback)

  mouseDownOnElementAndMove: (element, distance, callback) ->
    coordinates = getElementCoordinates(element)
    trix.triggerEvent(element, "mousedown", coordinates)

    destination = (offset) ->
      clientX: coordinates.clientX + offset
      clientY: coordinates.clientY + offset

    dragSpeed = 20

    after dragSpeed, ->
      offset = 0
      do drag = =>
        if ++offset <= distance
          trix.triggerEvent(element, "mousemove", destination(offset))
          after(dragSpeed, drag)
        else
          trix.triggerEvent(element, "mouseup", destination(distance))
          after(dragSpeed, callback)

typeCharacterInElement = (character, element, callback) ->
  charCode = character.charCodeAt(0)
  keyCode = character.toUpperCase().charCodeAt(0)

  return callback() unless trix.triggerEvent(element, "keydown", keyCode: keyCode, charCode: 0)

  trix.defer ->
    return callback() unless trix.triggerEvent(element, "keypress", keyCode: charCode, charCode: charCode)
    insertCharacter character, ->
      trix.triggerEvent(element, "input")

      trix.defer ->
        trix.triggerEvent(element, "keyup", keyCode: keyCode, charCode: 0)
        callback()

insertCharacter = (character, callback) ->
  node = document.createTextNode(character)
  trix.insertNode(node, callback)

simulateKeypress = (keyName, callback) ->
  switch keyName
    when "backspace"
      deleteInDirection("left", callback)
    when "delete"
      deleteInDirection("right", callback)
    when "return"
      node = document.createElement("br")
      trix.insertNode(node, callback)

deleteInDirection = (direction, callback) ->
  if trix.selectionIsCollapsed()
    trix.expandSelection direction, ->
      trix.deleteSelection()
      callback()
  else
    trix.deleteSelection()
    callback()

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2
