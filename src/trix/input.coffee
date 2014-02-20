class Trix.Input
  @events: "keydown keypress drop cut copy paste input".split(" ")
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
        event.preventDefault()

  keypress: (event) =>
    if event.which is null
      character = String.fromCharCode event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      character = String.fromCharCode event.charCode

    @responder?.insertString(character)
    event.preventDefault()

  drop: (event) =>
    @logAndCancel(event)

  cut: (event) =>
    @logAndCancel(event)

  copy: (event) =>
    @logAndCancel(event)

  paste: (event) =>
    @logAndCancel(event)

  input: (event) =>
    @responder?.render()
    @logAndCancel(event)

  backspace: (event) =>
    @responder?.deleteBackward()

  return: (event) =>
    @responder?.insertString("\n")

  logAndCancel: (event) =>
    console.log "trapped event:", event
    event.preventDefault()
