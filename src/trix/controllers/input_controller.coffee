#= require trix/lib/device_observer
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
    @canceledInputEventsSupported = true

    @deviceObserver = new Trix.DeviceObserver @element
    @deviceObserver.delegate = this

    for event, handler of @events
      @element.addEventListener(event, handler.bind(this), true)

  # Device observer delegate

  deviceDidActivateVirtualKeyboard: ->
    @canceledInputEventsSupported = false

  deviceDidDeactivateVirtualKeyboard: ->
    @canceledInputEventsSupported = true

  # Input handlers

  events:
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

      if character? and @cancelInputEvent(event)
        @delegate?.inputControllerWillPerformTyping()
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
        @delegate?.inputControllerWillMoveText()
        @responder?.moveTextFromRange(@draggedRange)
        delete @draggedRange

      else if files = event.dataTransfer.files
        @delegate?.inputControllerWillAttachFiles()
        for file in files
          if @responder?.insertFile(file)
            file.trixInserted = true

    cut: (event) ->
      @delegate?.inputControllerWillCutText()
      defer => @responder?.deleteBackward()

    paste: (event) ->
      event.preventDefault()
      if html = event.clipboardData.getData("text/html")
        @delegate?.inputControllerWillPasteText()
        @responder?.insertHTML(html)
      else if string = event.clipboardData.getData("text/plain")
        @delegate?.inputControllerWillPasteText()
        @responder?.insertString(string)

    compositionstart: (event) ->
      @delegate?.inputControllerWillStartComposition?()
      @composing = true

    compositionend: (event) ->
      @delegate?.inputControllerWillEndComposition?()
      @composedString = event.data

    input: (event) ->
      if @composing and @composedString?
        @delegate?.inputControllerDidComposeCharacters?(@composedString) if @composedString
        delete @composedString
        delete @composing

  keys:
    backspace: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteBackward()
      event.preventDefault()

    return: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString("\n")
      event.preventDefault()

    control:
      d: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.deleteForward()
        event.preventDefault()

      h: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @backspace(event)

      o: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n", updatePosition: false)
        event.preventDefault()

    alt:
      backspace: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.deleteWordBackward()
        event.preventDefault()

  cancelInputEvent: (event) ->
    if @canceledInputEventsSupported
      event.preventDefault()
      true
