class Trix.Input
  @events: "keydown keypress dragstart dragend drop cut paste compositionstart compositionend input".split(" ")
  @keys:
    0x08: "backspace"
    0x0D: "return"
    0x44: "d"
    0x48: "h"
    0x4f: "o"

  constructor: (@element, @responder) ->
    for event in @constructor.events
      @element.addEventListener(event, @[event], true)

  keydown: (event) =>
    if keyName = @constructor.keys[event.keyCode]
      context = switch
        when event.ctrlKey then @control
        when event.altKey then @alt
        else this

      context[keyName]?.call this, event

  keypress: (event) =>
    return if (event.metaKey or event.ctrlKey) and not event.altKey

    if event.which is null
      character = String.fromCharCode event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      character = String.fromCharCode event.charCode

    if character
      @responder?.insertString(character)
      event.preventDefault()

  dragstart: (event) =>
    target = event.target
    if range = @responder?.getSelectedRange()
      @draggedRange = range
    else if Trix.DOM.within(@element, target) and target.trixPosition?
      position = target.trixPosition
      @draggedRange = [position, position + 1]

  dragend: (event) =>
    delete @draggedRange

  drop: (event) =>
    event.preventDefault()
    point = [event.pageX, event.pageY]
    @responder?.positionAtPoint(point)

    if @draggedRange
      @responder?.moveTextFromRange(@draggedRange)
      delete @draggedRange

    else if id = event.dataTransfer.getData("id")
      element = document.getElementById(id)
      attachment = { type: "image" }
      attachment[key] = element[key] for key in ["src", "width", "height"]
      @responder?.insertAttachment(attachment)

  cut: (event) =>
    @responder?.deleteBackward()

  paste: (event) =>
    if text = event.clipboardData.getData("text/plain")
      @responder?.insertString(text)
    event.preventDefault()

  compositionstart: (event) =>
    @responder?.beginComposing()

  compositionend: (event) =>
    @composedString = event.data

  input: (event) =>
    if @responder?.isComposing()
      if @composedString?
        @responder?.endComposing(@composedString)
        delete @composedString
    else
      @responder?.render()
      @logAndCancel(event)

  backspace: (event) ->
    @responder?.deleteBackward()
    event.preventDefault()

  return: (event) ->
    @responder?.insertString("\n")
    event.preventDefault()

  control:
    d: (event) ->
      @responder?.deleteForward()
      event.preventDefault()

    h: (event) ->
      @backspace(event)

    o: (event) ->
      @responder?.insertString("\n", false)
      event.preventDefault()

  alt:
    backspace: (event) ->
      @responder?.deleteWordBackward()
      event.preventDefault()

  logAndCancel: (event) ->
    console.log "trapped event", event.type, event
    event.preventDefault()
