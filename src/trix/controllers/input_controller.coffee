#= require trix/observers/device_observer

{defer} = Trix.Helpers

class Trix.InputController
  pastedFileCount = 0

  @keyNames:
    0x08: "backspace"
    0x0D: "return"
    0x44: "d"
    0x48: "h"
    0x4f: "o"

  constructor: (@element) ->
    @deviceObserver = new Trix.DeviceObserver @element
    @deviceObserver.delegate = this

    for event, handler of @events
      @element.addEventListener(event, handler.bind(this), true)

  # Device observer delegate

  deviceDidActivateVirtualKeyboard: ->
    @virtualKeyboardIsActive = true

  deviceDidDeactivateVirtualKeyboard: ->
    delete @virtualKeyboardIsActive

  # Input handlers

  events:
    keydown: (event) ->
      if keyName = @constructor.keyNames[event.keyCode]
        context = switch
          when event.ctrlKey then @keys.control
          when event.altKey then @keys.alt
          when event.shiftKey then @keys.shift
          else @keys

        context[keyName]?.call(this, event)

    keypress: (event) ->
      return if @virtualKeyboardIsActive
      return if (event.metaKey or event.ctrlKey) and not event.altKey

      if event.which is null
        character = String.fromCharCode event.keyCode
      else if event.which isnt 0 and event.charCode isnt 0
        character = String.fromCharCode event.charCode

      if character?
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(character)

    dragenter: (event) ->
      event.preventDefault()

    dragstart: (event) ->
      target = event.target
      @draggedRange = @responder?.getLocationRange()

    dragover: (event) ->
      event.preventDefault() unless @draggedRange

    dragend: (event) ->
      delete @draggedRange

    drop: (event) ->
      event.preventDefault()
      point = [event.clientX, event.clientY]
      @responder?.setLocationRangeFromPoint(point)

      if @draggedRange
        @delegate?.inputControllerWillMoveText()
        @responder?.moveTextFromLocationRange(@draggedRange)
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
      paste = event.clipboardData

      if html = paste.getData("text/html")
        @delegate?.inputControllerWillPasteText()
        @responder?.insertHTML(html)
      else if string = paste.getData("text/plain")
        @delegate?.inputControllerWillPasteText()
        @responder?.insertString(string)

      if "Files" in paste.types
        if file = paste.items?[0]?.getAsFile?()
          if not file.name and extension = extensionForFile(file)
            file.name = "pasted-file-#{++pastedFileCount}.#{extension}"
          @delegate?.inputControllerWillAttachFiles()
          if @responder?.insertFile(file)
            file.trixInserted = true

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
      @responder?.insertLineBreak()
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

    shift:
      return: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n")
        event.preventDefault()

  extensionForFile = (file) ->
    file.type?.match(/\/(\w+)$/)?[1]
