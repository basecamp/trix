#= require trix/observers/mutation_observer
#= require trix/operations/file_verification_operation

{handleEvent, findClosestElementFromNode, findElementFromContainerAndOffset,
  defer, makeElement, innerElementIsActive} = Trix

inputLog = Trix.Logger.get("input")

class Trix.InputController extends Trix.BasicObject
  pastedFileCount = 0

  @keyNames:
    "8":  "backspace"
    "9":  "tab"
    "13": "return"
    "37": "left"
    "39": "right"
    "46": "delete"
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
      unless innerElementIsActive(@element)
        @eventName = eventName
        inputLog.group(eventName)
        @events[eventName].call(this, event)
        inputLog.groupEnd()

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
    inputLog.group("Mutation")
    inputLog.log("mutationSummary =", JSON.stringify(mutationSummary))

    unless @mutationIsExpected(mutationSummary)
      inputLog.log("mutation doesn't match input, replacing HTML")
      @responder?.replaceHTML(@element.innerHTML)
    @resetInputSummary()
    @requestRender()
    Trix.selectionChangeObserver.reset()

    inputLog.groupEnd()

  mutationIsExpected: (mutationSummary) ->
    return unless @inputSummary
    return true if @inputSummary.keyName is "return"
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
          Trix.selectionChangeObserver.reset()
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
      @serializeSelectionToDataTransfer(event.dataTransfer)
      @draggedRange = @responder?.getLocationRange()
      @delegate?.inputControllerDidStartDrag?()

    dragover: (event) ->
      if @draggedRange or @canAcceptDataTransfer(event.dataTransfer)
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
        @requestRender()

      else if documentJSON = event.dataTransfer.getData("application/x-trix-document")
        document = Trix.Document.fromJSONString(documentJSON)
        @responder?.insertDocument(document)
        @requestRender()

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
      pasteData = {paste}

      if pasteEventIsCrippledSafariHTMLPaste(event)
        @getPastedHTMLUsingHiddenElement (html) =>
          pasteData.html = html
          @delegate?.inputControllerWillPasteText(pasteData)
          @responder?.pasteHTML(html)
          @requestRender()
          @delegate?.inputControllerDidPaste(pasteData)
        return

      if html = paste.getData("text/html")
        pasteData.html = html
        @delegate?.inputControllerWillPasteText(pasteData)
        @responder?.pasteHTML(html)
        @requestRender()
        @delegate?.inputControllerDidPaste(pasteData)

      else if string = paste.getData("text/plain")
        pasteData.string = string
        @setInputSummary(textAdded: string, didDelete: @selectionIsExpanded())
        @delegate?.inputControllerWillPasteText(pasteData)
        @responder?.insertString(string)
        @requestRender()
        @delegate?.inputControllerDidPaste(pasteData)

      else if "Files" in paste.types
        if file = paste.items?[0]?.getAsFile?()
          if not file.name and extension = extensionForFile(file)
            file.name = "pasted-file-#{++pastedFileCount}.#{extension}"
          pasteData.file = file
          @delegate?.inputControllerWillAttachFiles()
          @responder?.insertFile(file)
          @requestRender()
          @delegate?.inputControllerDidPaste(pasteData)

      event.preventDefault()

    compositionstart: (event) ->
      @mutationObserver.stop()

    compositionend: (event) ->
      if (composedString = event.data)?
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(composedString)
        @setInputSummary(textAdded: composedString, didDelete: @selectionIsExpanded())
      @mutationObserver.start()

    input: (event) ->
      event.stopPropagation()

  keys:
    backspace: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @deleteInDirection("backward")

    delete: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @deleteInDirection("forward")

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

  # Private

  deleteInDirection: (direction) ->
    @responder?.deleteInDirection(direction)
    @setInputSummary(didDelete: true)

  serializeSelectionToDataTransfer: (dataTransfer) ->
    return unless dataTransfer?.setData?

    document = @responder?.getSelectedDocument().toSerializableDocument()
    element = Trix.DocumentView.render(document)
    html = element.innerHTML
    text = element.innerText

    dataTransfer.setData("application/x-trix-document", JSON.stringify(document))
    dataTransfer.setData("text/html", html)
    dataTransfer.setData("text/plain", text)

  canAcceptDataTransfer: (dataTransfer) ->
    types = {}
    types[type] = true for type in dataTransfer?.types ? []
    types["Files"] or types["application/x-trix-document"] or types["text/html"] or types["text/plain"]

  getPastedHTMLUsingHiddenElement: (callback) ->
    locationRange = @responder?.getLocationRange()

    element = makeElement(tagName: "div", editable: true, style: { position: "absolute", left: "-9999px" })
    document.body.appendChild(element)
    element.focus()

    requestAnimationFrame =>
      html = element.innerHTML
      document.body.removeChild(element)
      @responder?.setSelectionForLocationRange(locationRange)
      callback(html)

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

pasteEventIsCrippledSafariHTMLPaste = (event) ->
  if types = event.clipboardData?.types
    "text/html" not in types and ("com.apple.webarchive" in types or "com.apple.flat-rtfd" in types)
