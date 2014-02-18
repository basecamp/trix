class RichText.Input
  @events: "keydown keypress drop cut copy paste input".split(" ")

  constructor: (@element) ->

  install: ->
    for event in @constructor.events
      @element.addEventListener(event, @[event], true)

  remove: ->
    for event in @constructor.events
      @element.removeEventListener(event, @[event], true)

  keydown: (event) =>
    console.log "key down: key code = ", event.keyCode

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
    @logAndCancel(event)

  logAndCancel: (event) =>
    console.log "trapped event:", event
    event.preventDefault()
