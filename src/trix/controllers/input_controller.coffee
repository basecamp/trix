#= require trix/observers/mutation_observer
#= require trix/operations/file_verification_operation

{handleEvent, findClosestElementFromNode, findElementForContainerAtOffset, defer} = Trix

inputLog = Trix.Logger.get("input")

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
    @resetInputSummary()

    @mutationObserver = new Trix.MutationObserver @element
    @mutationObserver.delegate = this

    for eventName of @events
      handleEvent eventName, onElement: @element, withCallback: @handlerFor(eventName), inPhase: "capturing"

  handlerFor: (eventName) ->
    (event) =>
      try
        @eventName = eventName
        inputLog.group(eventName)
        @events[eventName].call(this, event)
        inputLog.groupEnd()
      catch error
        @delegate?.inputControllerDidThrowError?(error, {eventName})
        throw error

  setInputSummary: (summary = {}) ->
    @inputSummary.eventName = @eventName
    @inputSummary[key] = value for key, value of summary
    inputLog.log("#setInputSummary", JSON.stringify(@inputSummary))
    @inputSummary

  resetInputSummary: ->
    @inputSummary = {}

  # Render cycle

  editorWillRenderDocumentElement: ->
    @mutationObserver.stop()

  editorDidRenderDocumentElement: ->
    @mutationObserver.start()

  requestRender: ->
    @delegate?.inputControllerDidRequestRender?()

  # Mutation observer delegate

  elementDidMutate: (mutationSummary) ->
    try
      inputLog.group("Mutation")
      inputLog.log("mutationSummary =", JSON.stringify(mutationSummary))

      unless @mutationIsExpected(mutationSummary)
        inputLog.log("mutation doesn't match input, replacing HTML")
        @responder?.replaceHTML(@element.innerHTML)
      @resetInputSummary()
      @requestRender()

      inputLog.groupEnd()
    catch error
      @delegate?.inputControllerDidThrowError?(error, {mutationSummary})
      throw error

  mutationIsExpected: (mutationSummary) ->
    return unless @inputSummary
    unhandledAddition = mutationSummary.textAdded? and mutationSummary.textAdded isnt @inputSummary.textAdded
    unhandledDeletion = mutationSummary.textDeleted? and not @inputSummary.didDelete
    not (unhandledAddition or unhandledDeletion)

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
      return if @inputSummary.eventName is "compositionend"
      @resetInputSummary()

      if keyName = @constructor.keyNames[event.keyCode]
        context = @keys
        for modifier in ["ctrl", "alt", "shift"] when event["#{modifier}Key"]
          modifier = "control" if modifier is "ctrl"
          context = @keys[modifier]
          if context[keyName]
            keyModifier = modifier
            break

        if context[keyName]?
          @setInputSummary({keyName, keyModifier})
          context[keyName].call(this, event)

      if keyEventIsKeyboardCommand(event)
        if character = String.fromCharCode(event.keyCode).toLowerCase()
          keys = (modifier for modifier in ["alt", "shift"] when event["#{modifier}Key"])
          keys.push(character)
          if @delegate?.inputControllerDidReceiveKeyboardCommand(keys)
            event.preventDefault()

    keypress: (event) ->
      return if @inputSummary.eventName?
      return if (event.metaKey or event.ctrlKey) and not event.altKey
      return if keyEventIsWebInspectorShortcut(event)
      return if keyEventIsPasteAndMatchStyleShortcut(event)

      if event.which is null
        character = String.fromCharCode event.keyCode
      else if event.which isnt 0 and event.charCode isnt 0
        character = String.fromCharCode event.charCode

      if character?
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(character)
        @setInputSummary(textAdded: character, didDelete: @selectionIsExpanded())

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
      @deleteInDirection("backward")

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
      @mutationObserver.stop()

    compositionend: (event) ->
      if (composedString = event.data)?
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(composedString)
        @setInputSummary(textAdded: composedString, didDelete: @selectionIsExpanded())
      @mutationObserver.start()

  keys:
    backspace: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @deleteInDirection("backward")

    return: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertLineBreak()

    tab: (event) ->
      if @responder?.canChangeBlockAttributeLevel()
        @responder?.increaseBlockAttributeLevel()
        event.preventDefault()

    left: (event) ->
      if @selectionIsInCursorTarget()
        event.preventDefault()
        @responder?.moveCursorInDirection("backward")

    right: (event) ->
      if @selectionIsInCursorTarget()
        event.preventDefault()
        @responder?.moveCursorInDirection("forward")

    control:
      d: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @deleteInDirection("forward")

      h: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @deleteInDirection("backward")

      o: (event) ->
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n", updatePosition: false)
        @requestRender()

    alt:
      backspace: (event) ->
        @delegate?.inputControllerWillPerformTyping()

    shift:
      return: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n")

      left: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @expandSelectionInDirection("backward")

      right: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @expandSelectionInDirection("forward")

  deleteInDirection: (direction) ->
    @responder?.deleteInDirection(direction)
    @setInputSummary(didDelete: true)

  @proxyMethod "responder?.expandSelectionInDirection"
  @proxyMethod "responder?.selectionIsInCursorTarget"
  @proxyMethod "responder?.selectionIsExpanded"

extensionForFile = (file) ->
  file.type?.match(/\/(\w+)$/)?[1]

keyEventIsWebInspectorShortcut = (event) ->
  event.metaKey and event.altKey and not event.shiftKey and event.keyCode is 94

keyEventIsPasteAndMatchStyleShortcut = (event) ->
  event.metaKey and event.altKey and event.shiftKey and event.keyCode is 9674

keyEventIsKeyboardCommand = (event) ->
  if /Mac|^iP/.test(navigator.platform) then event.metaKey else event.ctrlKey
