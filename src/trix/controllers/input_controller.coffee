#= require trix/observers/mutation_observer
#= require trix/operations/file_verification_operation

{handleEvent, findClosestElementFromNode, findElementFromContainerAndOffset,
  defer, makeElement, innerElementIsActive, summarizeStringChange} = Trix

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
      @handleInput ->
        unless innerElementIsActive(@element)
          @eventName = eventName
          @events[eventName].call(this, event)

  setInputSummary: (summary = {}) ->
    @inputSummary.eventName = @eventName
    @inputSummary[key] = value for key, value of summary
    @inputSummary

  resetInputSummary: ->
    @inputSummary = {}

  # Render cycle

  editorWillSyncDocumentView: ->
    @mutationObserver.stop()

  editorDidSyncDocumentView: ->
    @mutationObserver.start()

  requestRender: ->
    @delegate?.inputControllerDidRequestRender?()

  # Mutation observer delegate

  elementDidMutate: (mutationSummary) ->
    @handleInput ->
      unless @mutationIsExpected(mutationSummary)
        @responder?.replaceHTML(@element.innerHTML)
      @resetInputSummary()
      @requestRender()
      Trix.selectionChangeObserver.reset()

  mutationIsExpected: (mutationSummary) ->
    if @inputSummary
      if @inputSummary.preferDocument?
        @inputSummary.preferDocument
      else
        unhandledAddition = mutationSummary.textAdded isnt @inputSummary.textAdded
        unhandledDeletion = mutationSummary.textDeleted? and not @inputSummary.didDelete
        not (unhandledAddition or unhandledDeletion)

  # File verification

  attachFiles: (files) ->
    operations = (new Trix.FileVerificationOperation(file) for file in files)
    Promise.all(operations).then (files) =>
      @handleInput ->
        @delegate?.inputControllerWillAttachFiles()
        @responder?.insertFile(file) for file in files
        @requestRender()

  # Input handlers

  events:
    keydown: (event) ->
      @resetInputSummary() unless @inputSummary.composing

      if keyName = @constructor.keyNames[event.keyCode]
        context = @keys
        for modifier in ["ctrl", "alt", "shift", "meta"] when event["#{modifier}Key"]
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
      @draggedRange = @responder?.getSelectedRange()
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
      @draggedRange = null
      @draggingPoint = null

    drop: (event) ->
      event.preventDefault()
      files = event.dataTransfer?.files

      point = [event.clientX, event.clientY]
      @responder?.setLocationRangeFromPoint(point)

      if files?.length
        @attachFiles(files)

      else if @draggedRange
        @delegate?.inputControllerWillMoveText()
        @responder?.moveTextFromRange(@draggedRange)
        @draggedRange = null
        @requestRender()

      else if documentJSON = event.dataTransfer.getData("application/x-trix-document")
        document = Trix.Document.fromJSONString(documentJSON)
        @responder?.insertDocument(document)
        @requestRender()

      @draggedRange = null
      @draggingPoint = null

    cut: (event) ->
      if @serializeSelectionToDataTransfer(event.clipboardData)
        event.preventDefault()

      @delegate?.inputControllerWillCutText()
      @deleteInDirection("backward")
      @requestRender() if event.defaultPrevented

    copy: (event) ->
      if @serializeSelectionToDataTransfer(event.clipboardData)
        event.preventDefault()

    paste: (event) ->
      paste = event.clipboardData ? event.testClipboardData
      return unless paste?
      pasteData = {paste}

      if pasteEventIsCrippledSafariHTMLPaste(event)
        @getPastedHTMLUsingHiddenElement (html) =>
          pasteData.html = html
          @delegate?.inputControllerWillPasteText(pasteData)
          @responder?.insertHTML(html)
          @requestRender()
          @delegate?.inputControllerDidPaste(pasteData)
        return

      if html = paste.getData("text/html")
        pasteData.html = html
        @delegate?.inputControllerWillPasteText(pasteData)
        @responder?.insertHTML(html)
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
      unless @selectionIsExpanded()
        textAdded = @responder?.insertPlaceholder()
        @setInputSummary({textAdded})
        @requestRender()

      @setInputSummary(composing: true, compositionStart: event.data)

    compositionupdate: (event) ->
      if @responder?.selectPlaceholder()
        @responder?.forgetPlaceholder()

      @setInputSummary(composing: true, compositionUpdate: event.data)

    compositionend: (event) ->
      if @responder?.selectPlaceholder()
        @responder?.forgetPlaceholder()

      {compositionStart} = @inputSummary
      {data} = event

      if compositionStart? and data? and compositionStart isnt data
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(data)
        {added, removed} = summarizeStringChange(compositionStart, data)
        @setInputSummary(textAdded: added, didDelete: Boolean(removed))

    input: (event) ->
      event.stopPropagation()

  keys:
    backspace: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @deleteInDirection("backward", event)

    delete: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @deleteInDirection("forward", event)

    return: (event) ->
      @setInputSummary(preferDocument: true)
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertLineBreak()

    tab: (event) ->
      if @responder?.canIncreaseBlockAttributeLevel()
        @responder?.increaseBlockAttributeLevel()
        @requestRender()
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
        @deleteInDirection("forward", event)

      h: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @deleteInDirection("backward", event)

      o: (event) ->
        event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n", updatePosition: false)
        @requestRender()

    shift:
      return: (event) ->
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString("\n")

      tab: (event) ->
        if @responder?.canDecreaseBlockAttributeLevel()
          @responder?.decreaseBlockAttributeLevel()
          @requestRender()
          event.preventDefault()

      left: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @expandSelectionInDirection("backward")

      right: (event) ->
        if @selectionIsInCursorTarget()
          event.preventDefault()
          @expandSelectionInDirection("forward")

    alt:
      backspace: (event) ->
        @setInputSummary(preferDocument: false)
        @delegate?.inputControllerWillPerformTyping()

    meta:
      backspace: (event) ->
        @setInputSummary(preferDocument: false)
        @delegate?.inputControllerWillPerformTyping()

  # Private

  handleInput: (callback) ->
    try
      @delegate?.inputControllerWillHandleInput()
      callback.call(this)
    finally
      @delegate?.inputControllerDidHandleInput()

  deleteInDirection: (direction, event) ->
    if @responder?.deleteInDirection(direction) is false
      if event
        event.preventDefault()
        @requestRender()
    else
      @setInputSummary(didDelete: true)

  serializeSelectionToDataTransfer: (dataTransfer) ->
    return unless dataTransferIsWritable(dataTransfer)
    document = @responder?.getSelectedDocument().toSerializableDocument()

    dataTransfer.setData("application/x-trix-document", JSON.stringify(document))
    dataTransfer.setData("text/html", Trix.DocumentView.render(document).innerHTML)
    dataTransfer.setData("text/plain", document.toString().replace(/\n$/, ""))
    true

  canAcceptDataTransfer: (dataTransfer) ->
    types = {}
    types[type] = true for type in dataTransfer?.types ? []
    types["Files"] or types["application/x-trix-document"] or types["text/html"] or types["text/plain"]

  getPastedHTMLUsingHiddenElement: (callback) ->
    selectedRange = @responder?.getSelectedRange()

    style =
      position: "absolute"
      left: "#{window.pageXOffset}px"
      top: "#{window.pageYOffset}px"
      opacity: 0

    element = makeElement({style, tagName: "div", editable: true})
    document.body.appendChild(element)
    element.focus()

    requestAnimationFrame =>
      html = element.innerHTML
      document.body.removeChild(element)
      @responder?.setSelectedRange(selectedRange)
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

testTransferData = "application/x-trix-feature-detection": "test"

dataTransferIsWritable = (dataTransfer) ->
  return unless dataTransfer?.setData?
  for key, value of testTransferData
    dataTransfer.setData(key, value)
    return unless dataTransfer.getData(key) is value
  true
