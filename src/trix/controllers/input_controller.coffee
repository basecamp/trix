#= require trix/observers/mutation_observer
#= require trix/operations/file_verification_operation

{handleEvent, findClosestElementFromNode, findElementForContainerAtOffset, defer} = Trix

class Trix.InputController extends Trix.BasicObject
  pastedFileCount = 0

  @keyNames:
    "8":  "backspace"
    "9":  "tab"
    "13": "return"
    "37": "left"
    "39": "right"
    "68": "d"
    "72": "h"
    "79": "o"

  constructor: (@element) ->
    @mutationObserver = new Trix.MutationObserver @element
    @mutationObserver.delegate = this

    for eventName of @events
      handleEvent eventName, onElement: @element, withCallback: @handlerFor(eventName), inPhase: "capturing"

  handlerFor: (eventName) ->
    (event) =>
      try
        console.group(eventName)
        Trix.selectionChangeObserver.update()
        console.log new Date().getTime()
        @events[eventName].call(this, event)
        console.log "Document: #{JSON.stringify(@responder.document.toString())}"
        console.log "HTML: '#{@element.innerHTML}'"
        console.groupEnd()
      catch error
        @delegate?.inputControllerDidThrowError?(error, {eventName})
        throw error

  # Render cycle

  editorWillRender: ->
    @mutationObserver.stop()

  editorDidRender: ->
    @mutationObserver.start()

  editorDidChangeDocument: ->
    @documentChanged = true

  requestRender: ->
    @delegate?.inputControllerDidRequestRender?()

  # Mutation observer delegate

  elementDidMutate: (mutations) ->
    ignoringMutations = @isIgnoringMutations()
    shouldReplaceHTML = not @documentChanged
    delete @documentChanged

    defer =>
      console.group "Mutation#{[" (ignored)" if ignoringMutations]}:", mutations
      unless ignoringMutations
        try
          if shouldReplaceHTML
            console.log "Document is stale, replacing HTML"
            @responder?.replaceHTML(@element.innerHTML)
          @requestRender()
        catch error
          @delegate?.inputControllerDidThrowError?(error, {mutations})
          throw error
      console.groupEnd()

  isIgnoringMutations: ->
    @composing

  # File verification

  attachFiles: (files) ->
    operations = (new Trix.FileVerificationOperation(file) for file in files)
    Promise.all(operations).then (files) =>
      @delegate?.inputControllerWillAttachFiles()
      @responder?.insertFile(file) for file in files
      @requestRender()

  # Input handlers

  events:
    keydown: (event) ->
      delete @keypressHandled
      if keyName = @constructor.keyNames[event.keyCode]
        context = @keys
        for modifier in ["ctrl", "alt", "shift"] when event["#{modifier}Key"]
          modifier = "control" if modifier is "ctrl"
          context = @keys[modifier]
          break if context[keyName]

        if context[keyName]?
          console.log {context, keyName}
          context[keyName].call(this, event)

      if keyEventIsKeyboardCommand(event)
        if character = String.fromCharCode(event.keyCode).toLowerCase()
          keys = (modifier for modifier in ["alt", "shift"] when event["#{modifier}Key"])
          keys.push(character)
          if @delegate?.inputControllerDidReceiveKeyboardCommand(keys)
            event.preventDefault()

    keypress: (event) ->
      return if @keypressHandled
      return if (event.metaKey or event.ctrlKey) and not event.altKey
      return if keyEventIsWebInspectorShortcut(event)
      return if keyEventIsPasteAndMatchStyleShortcut(event)

      if event.which is null
        character = String.fromCharCode event.keyCode
      else if event.which isnt 0 and event.charCode isnt 0
        character = String.fromCharCode event.charCode

      if character?
        console.log "character = \"#{character}\""
        @keypressHandled = true
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(character)

    dragenter: (event) ->
      event.preventDefault()

    dragstart: (event) ->
      target = event.target
      @draggedRange = @responder?.getLocationRange()
      @delegate?.inputControllerDidStartDrag?()

    dragover: (event) ->
      if @draggedRange or "Files" in event.dataTransfer?.types
        event.preventDefault()
        draggingPoint = [event.clientX, event.clientY]
        if draggingPoint.toString() isnt @draggingPoint?.toString()
          @draggingPoint = draggingPoint
          @delegate?.inputControllerDidReceiveDragOverPoint?(@draggingPoint)

    dragend: (event) ->
      @delegate?.inputControllerDidCancelDrag?()
      delete @draggedRange
      delete @draggingPoint

    drop: (event) ->
      event.preventDefault()
      point = [event.clientX, event.clientY]
      @responder?.setLocationRangeFromPoint(point)

      if @draggedRange
        @delegate?.inputControllerWillMoveText()
        @responder?.moveTextFromLocationRange(@draggedRange)
        delete @draggedRange

      else if files = event.dataTransfer.files
        @attachFiles(event.dataTransfer.files)

      delete @draggedRange
      delete @draggingPoint

    cut: (event) ->
      @delegate?.inputControllerWillCutText()
      defer => @responder?.deleteBackward()

    paste: (event) ->
      paste = event.clipboardData ? event.testClipboardData
      return unless paste?
      return for type in paste.types when type.match(/^com\.apple/)
      event.preventDefault()

      if html = paste.getData("text/html")
        @delegate?.inputControllerWillPasteText({paste, html})
        @responder?.insertHTML(html)
      else if string = paste.getData("text/plain")
        @delegate?.inputControllerWillPasteText({paste, string})
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

    keyup: (event) ->

    input: (event) ->
      if @composing and @composedString?
        @delegate?.inputControllerDidComposeCharacters?(@composedString) if @composedString
        delete @composedString
        delete @composing
      else if not @keypressHandled
        @responder?.replaceHTML(@element.innerHTML)
        @requestRender()
      delete @keypressHandled

  keys:
    backspace: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")
      @keypressHandled = true

    return: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertLineBreak()
      @keypressHandled = true

    tab: (event) ->
      if @responder?.canChangeBlockAttributeLevel()
        @responder?.increaseBlockAttributeLevel()
        event.preventDefault()

    left: (event) ->
      if @selectionIsInCursorTarget()
        event.preventDefault()
        @responder?.adjustPositionInDirection("backward")

    right: (event) ->
      if @selectionIsInCursorTarget()
        event.preventDefault()
        @responder?.adjustPositionInDirection("forward")

    control:
      d: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.deleteInDirection("forward")

      h: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @backspace(event)

      o: (event) ->
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n", updatePosition: false)

    alt:
      backspace: (event) ->
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.deleteWordBackward()

    shift:
      return: (event) ->
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n")

      left: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @responder?.expandLocationRangeInDirection("backward")

      right: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @responder?.expandLocationRangeInDirection("forward")

  selectionIsInCursorTarget: ->
    @responder?.selectionIsInCursorTarget()

  extensionForFile = (file) ->
    file.type?.match(/\/(\w+)$/)?[1]

keyEventIsWebInspectorShortcut = (event) ->
  event.metaKey and event.altKey and not event.shiftKey and event.keyCode is 94

keyEventIsPasteAndMatchStyleShortcut = (event) ->
  event.metaKey and event.altKey and event.shiftKey and event.keyCode is 9674

keyEventIsKeyboardCommand = (event) ->
  if /Mac|^iP/.test(navigator.platform) then event.metaKey else event.ctrlKey
