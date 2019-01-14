helpers = Trix.TestHelpers

keyCodes = {}
for code, name of Trix.config.keyNames
  keyCodes[name] = code

isIE = /Windows.*Trident/.test(navigator.userAgent)

helpers.extend
  createEvent: (type, properties = {}) ->
    event = document.createEvent("Events")
    event.initEvent(type, true, true)
    for key, value of properties
      event[key] = value
    event

  triggerEvent: (element, type, properties) ->
    element.dispatchEvent(helpers.createEvent(type, properties))

  triggerInputEvent: (element, type, properties = {}) ->
    if Trix.config.input.getLevel() is 2
      if properties.ranges
        ranges = properties.ranges
        delete properties.ranges
      else
        ranges = []
        selection = window.getSelection()
        if selection.rangeCount > 0
          ranges.push(selection.getRangeAt(0).cloneRange())
      properties.getTargetRanges = -> ranges
      helpers.triggerEvent(element, type, properties)

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

    if "Files" in testClipboardData.types
      testClipboardData.files = testClipboardData.items

    helpers.triggerInputEvent(document.activeElement, "beforeinput", inputType: "insertFromPaste", dataTransfer: testClipboardData)
    helpers.triggerEvent(document.activeElement, "paste", {testClipboardData})
    requestAnimationFrame(callback) if callback

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
    properties = which: code, keyCode: code, charCode: 0, key: capitalize(keyName)

    return callback() unless helpers.triggerEvent(element, "keydown", properties)

    simulateKeypress keyName, ->
      helpers.defer ->
        helpers.triggerEvent(element, "keyup", properties)
        helpers.defer(callback)

  startComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerEvent(element, "compositionstart", data: "")
    helpers.triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
    helpers.triggerEvent(element, "compositionupdate", data: data)
    helpers.triggerEvent(element, "input")

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node, callback)

  updateComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
    helpers.triggerEvent(element, "compositionupdate", data: data)
    helpers.triggerEvent(element, "input")

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node, callback)

  endComposition: (data, callback) ->
    element = document.activeElement
    helpers.triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: data)
    helpers.triggerEvent(element, "compositionupdate", data: data)

    node = document.createTextNode(data)
    helpers.insertNode(node)
    helpers.selectNode(node)
    helpers.collapseSelection "right", ->
      helpers.triggerEvent(element, "input")
      helpers.triggerEvent(element, "compositionend", data: data)
      requestAnimationFrame(callback)

  clickElement: (element, callback) ->
    if helpers.triggerEvent(element, "mousedown")
      helpers.defer ->
        if helpers.triggerEvent(element, "mouseup")
          helpers.defer ->
            helpers.triggerEvent(element, "click")
            helpers.defer(callback)

  dragToCoordinates: (coordinates, callback) ->
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

    helpers.triggerEvent(element, "mousemove")

    dragstartData = {dataTransfer}
    helpers.triggerEvent(element, "dragstart", dragstartData)
    helpers.triggerInputEvent(element, "beforeinput", inputType: "deleteByDrag")

    dropData = {dataTransfer}
    dropData[key] = value for key, value of coordinates
    helpers.triggerEvent(element, "drop", dropData)

    {clientX, clientY} = coordinates
    domRange = helpers.createDOMRangeFromPoint(clientX, clientY)
    helpers.triggerInputEvent(element, "beforeinput", inputType: "insertFromDrop", ranges: [domRange])

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
    helpers.triggerInputEvent(element, "beforeinput", inputType: "insertText", data: character)
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
      helpers.defer ->
        helpers.triggerInputEvent(document.activeElement, "beforeinput", inputType: "insertParagraph")
        node = document.createElement("br")
        helpers.insertNode(node, callback)

deleteInDirection = (direction, callback) ->
  if helpers.selectionIsCollapsed()
    getComposition().expandSelectionInDirection(if direction is "left" then "backward" else "forward")
    helpers.defer ->
      inputType = if direction is "left" then "deleteContentBackward" else "deleteContentForward"
      helpers.triggerInputEvent(document.activeElement, "beforeinput", {inputType})
      helpers.defer ->
        helpers.deleteSelection()
        callback()
  else
    helpers.triggerInputEvent(document.activeElement, "beforeinput", inputType: "deleteContentBackward")
    helpers.deleteSelection()
    callback()

getElementCoordinates = (element) ->
  rect = element.getBoundingClientRect()
  clientX: rect.left + rect.width / 2
  clientY: rect.top + rect.height / 2

capitalize = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)
