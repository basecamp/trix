class Trix.Input
  @events: "keydown keypress drop cut paste input".split(" ")
  @keys:
    0x08: "backspace"
    0x0D: "return"

  constructor: (@element, @responder) ->
    for event in @constructor.events
      @element.addEventListener(event, @[event], true)

  keydown: (event) =>
    if keyName = @constructor.keys[event.keyCode]
      if handler = @[keyName]
        handler.call this, event

  keypress: (event) =>
    return if event.metaKey or event.ctrlKey or event.altKey

    if event.which is null
      character = String.fromCharCode event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      character = String.fromCharCode event.charCode

    if character
      @responder?.insertString(character)
      event.preventDefault()

  drop: (event) =>
    @logAndCancel(event)

  cut: (event) =>
    @responder?.deleteBackward()

  paste: (event) =>
    if text = event.clipboardData.getData("text/plain")
      @responder?.insertString(text)
    event.preventDefault()

  input: (event) =>
    @responder?.render()
    @logAndCancel(event)

  backspace: (event) =>
    if event.altKey
      @responder?.deleteWordBackwards()
    else
      @responder?.deleteBackward()
    event.preventDefault()

  return: (event) =>
    @responder?.insertString("\n")
    event.preventDefault()

  logAndCancel: (event) =>
    console.log "trapped event:", event
    event.preventDefault()
