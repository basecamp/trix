class Trix.Input
  @events: "keydown keypress drop cut paste input".split(" ")
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
    console.log "trapped event:", event
    event.preventDefault()
