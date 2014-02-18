class RichText.Input
  @events: "keydown keypress drop cut copy paste input".split(" ")
  @keys:
    0x08: "backspace"
    0x0D: "return"
    0x25: "left"
    0x27: "right"

  constructor: (@element) ->

  install: ->
    for event in @constructor.events
      @element.addEventListener(event, @[event], true)

  remove: ->
    for event in @constructor.events
      @element.removeEventListener(event, @[event], true)

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

    @delegate?.didTypeCharacter(character)
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
    @delegate?.didReceiveExternalChange()
    @logAndCancel(event)

  backspace: (event) =>
    @delegate?.didPressBackspace()

  return: (event) =>
    @delegate?.didPressReturn()

  left: (event) =>

  right: (event) =>

  logAndCancel: (event) =>
    console.log "trapped event:", event
    event.preventDefault()
