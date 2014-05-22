#= require trix/lib/helpers

{defer} = Trix.Helpers

class Trix.InputController
  @keyNames:
    0x08: "backspace"
    0x0D: "return"
    0x44: "d"
    0x48: "h"
    0x4f: "o"

  constructor: (@element) ->
    for event, handler of @events
      @element.addEventListener(event, handler.bind(this), true)

  # Input handlers

  events:
    focus: (event) ->
      @cacheCanceledInputEventSupport()

    blur: (event) ->
      @expireCanceledInputEventSupportCache()

    keydown: (event) ->
      if keyName = @constructor.keyNames[event.keyCode]
        context = switch
          when event.ctrlKey then @keys.control
          when event.altKey then @keys.alt
          else @keys

        context[keyName]?.call(this, event)

    keypress: (event) ->
      return if (event.metaKey or event.ctrlKey) and not event.altKey

      if event.which is null
        character = String.fromCharCode event.keyCode
      else if event.which isnt 0 and event.charCode isnt 0
        character = String.fromCharCode event.charCode

      if character and @deviceSupportsCanceledInputEvents()
        event.preventDefault()
        @responder?.insertString(character)

    dragenter: (event) ->
      event.preventDefault()

    dragstart: (event) ->
      target = event.target

      if range = @responder?.getSelectedRange()
        @draggedRange = range

      else if Trix.DOM.within(@element, target) and target.trixPosition?
        position = target.trixPosition
        @draggedRange = [position, position + 1]

    dragover: (event) ->
      event.preventDefault() unless @draggedRange

    dragend: (event) ->
      delete @draggedRange

    drop: (event) ->
      event.preventDefault()
      point = [event.pageX, event.pageY]
      @responder?.requestPositionAtPoint(point)

      if @draggedRange
        @responder?.moveTextFromRange(@draggedRange)
        delete @draggedRange

      else if files = event.dataTransfer.files
        for file in files
          if @responder?.insertFile(file)
            file.trixInserted = true

    cut: (event) ->
      defer => @responder?.deleteBackward()

    paste: (event) ->
      event.preventDefault()
      if html = event.clipboardData.getData("text/html")
        @responder?.insertHTML(html)
      else if string = event.clipboardData.getData("text/plain")
        @responder?.insertString(string)

    compositionstart: (event) ->
      @delegate?.inputControllerWillComposeCharacters?()
      @composing = true

    compositionend: (event) ->
      @composedString = event.data

    input: (event) ->
      if @composing
        if @composedString?
          @delegate?.inputControllerDidComposeCharacters?(@composedString)
          delete @composedString
          delete @composing

  keys:
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
        @responder?.insertString("\n", updatePosition: false)
        event.preventDefault()

    alt:
      backspace: (event) ->
        @responder?.deleteWordBackward()
        event.preventDefault()

  logAndCancel: (event) ->
    console.log "trapped event", event.type, event
    event.preventDefault()

  # Devices with a virtual keyboard don't respond well to canceled input events.
  # On iOS for example, the shift key remains active and autocorrect doesn't work.
  deviceSupportsCanceledInputEvents: ->
    @cacheCanceledInputEventSupport()

  cacheCanceledInputEventSupport: ->
    @canceledEventSuppport ?= virtualKeyboardHeight() is 0

  expireCanceledInputEventSupportCache: ->
    delete @canceledEventSuppport

  virtualKeyboardHeight = ->
    return 0 unless "ontouchstart" of window

    startLeft = document.body.scrollLeft
    startTop = document.body.scrollTop
    startHeight = window.innerHeight

    # When a keyboard is present, a different innerHeight
    # is revealed after scrolling to the bottom of the document
    # and the difference in height is the keyboard's height.
    window.scrollTo(startTop, document.body.scrollHeight)
    keyboardHeight = startHeight - window.innerHeight
    window.scrollTo(startLeft, startTop)

    keyboardHeight
