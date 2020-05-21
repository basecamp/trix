#= require trix/controllers/input_controller

{makeElement, objectsAreEqual, tagName, browser, keyEventIsKeyboardCommand,
 dataTransferIsWritable, dataTransferIsPlainText} = Trix

{keyNames} = Trix.config

class Trix.Level0InputController extends Trix.InputController
  pastedFileCount = 0

  constructor: ->
    super
    @resetInputSummary()

  setInputSummary: (summary = {}) ->
    @inputSummary.eventName = @eventName
    @inputSummary[key] = value for key, value of summary
    @inputSummary

  resetInputSummary: ->
    @inputSummary = {}

  reset: ->
    @resetInputSummary()
    Trix.selectionChangeObserver.reset()

  # Mutation observer delegate

  elementDidMutate: (mutationSummary) ->
    if @isComposing()
      @delegate?.inputControllerDidAllowUnhandledInput?()
    else
      @handleInput ->
        if @mutationIsSignificant(mutationSummary)
          if @mutationIsExpected(mutationSummary)
            @requestRender()
          else
            @requestReparse()
        @reset()

  mutationIsExpected: ({textAdded, textDeleted}) ->
    return true if @inputSummary.preferDocument

    mutationAdditionMatchesSummary =
      if textAdded?
        textAdded is @inputSummary.textAdded
      else
        not @inputSummary.textAdded
    mutationDeletionMatchesSummary =
      if textDeleted?
        @inputSummary.didDelete
      else
        not @inputSummary.didDelete

    unexpectedNewlineAddition =
      textAdded in ["\n", " \n"] and not mutationAdditionMatchesSummary
    unexpectedNewlineDeletion =
      textDeleted is "\n" and not mutationDeletionMatchesSummary
    singleUnexpectedNewline =
      (unexpectedNewlineAddition and not unexpectedNewlineDeletion) or
      (unexpectedNewlineDeletion and not unexpectedNewlineAddition)

    if singleUnexpectedNewline
      if range = @getSelectedRange()
        offset =
          if unexpectedNewlineAddition
            textAdded.replace(/\n$/, "").length or -1
          else
            textAdded?.length or 1
        if @responder?.positionIsBlockBreak(range[1] + offset)
          return true

    mutationAdditionMatchesSummary and mutationDeletionMatchesSummary

  mutationIsSignificant: (mutationSummary) ->
    textChanged = Object.keys(mutationSummary).length > 0
    composedEmptyString = @compositionInput?.getEndData() is ""
    textChanged or not composedEmptyString

  # Input handlers

  events:
    keydown: (event) ->
      @resetInputSummary() unless @isComposing()
      @inputSummary.didInput = true

      if keyName = keyNames[event.keyCode]
        context = @keys

        for modifier in ["ctrl", "alt", "shift", "meta"] when event["#{modifier}Key"]
          modifier = "control" if modifier is "ctrl"
          context = context?[modifier]

        if context?[keyName]?
          @setInputSummary({keyName})
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
      return if event.metaKey
      return if event.ctrlKey and not event.altKey

      if string = stringFromKeyEvent(event)
        @delegate?.inputControllerWillPerformTyping()
        @responder?.insertString(string)
        @setInputSummary(textAdded: string, didDelete: @selectionIsExpanded())

    textInput: (event) ->
      # Handle autocapitalization
      {data} = event
      {textAdded} = @inputSummary
      if textAdded and textAdded isnt data and textAdded.toUpperCase() is data
        range = @getSelectedRange()
        @setSelectedRange([range[0], range[1] + textAdded.length])
        @responder?.insertString(data)
        @setInputSummary(textAdded: data)
        @setSelectedRange(range)

    dragenter: (event) ->
      event.preventDefault()

    dragstart: (event) ->
      target = event.target
      @serializeSelectionToDataTransfer(event.dataTransfer)
      @draggedRange = @getSelectedRange()
      @delegate?.inputControllerDidStartDrag?()

    dragover: (event) ->
      if @draggedRange or @canAcceptDataTransfer(event.dataTransfer)
        event.preventDefault()
        draggingPoint = x: event.clientX, y: event.clientY
        unless objectsAreEqual(draggingPoint, @draggingPoint)
          @draggingPoint = draggingPoint
          @delegate?.inputControllerDidReceiveDragOverPoint?(@draggingPoint)

    dragend: (event) ->
      @delegate?.inputControllerDidCancelDrag?()
      @draggedRange = null
      @draggingPoint = null

    drop: (event) ->
      event.preventDefault()
      files = event.dataTransfer?.files

      point = x: event.clientX, y: event.clientY
      @responder?.setLocationRangeFromPointRange(point)

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
      if @responder?.selectionIsExpanded()
        if @serializeSelectionToDataTransfer(event.clipboardData)
          event.preventDefault()

        @delegate?.inputControllerWillCutText()
        @deleteInDirection("backward")
        @requestRender() if event.defaultPrevented

    copy: (event) ->
      if @responder?.selectionIsExpanded()
        if @serializeSelectionToDataTransfer(event.clipboardData)
          event.preventDefault()

    paste: (event) ->
      clipboard = event.clipboardData ? event.testClipboardData
      paste = {clipboard}

      if not clipboard? or pasteEventIsCrippledSafariHTMLPaste(event)
        @getPastedHTMLUsingHiddenElement (html) =>
          paste.type = "text/html"
          paste.html = html
          @delegate?.inputControllerWillPaste(paste)
          @responder?.insertHTML(paste.html)
          @requestRender()
          @delegate?.inputControllerDidPaste(paste)
        return

      if href = clipboard.getData("URL")
        paste.type = "text/html"
        if name = clipboard.getData("public.url-name")
          string = Trix.squishBreakableWhitespace(name).trim()
        else
          string = href
        paste.html = @createLinkHTML(href, string)
        @delegate?.inputControllerWillPaste(paste)
        @setInputSummary(textAdded: string, didDelete: @selectionIsExpanded())
        @responder?.insertHTML(paste.html)
        @requestRender()
        @delegate?.inputControllerDidPaste(paste)

      else if dataTransferIsPlainText(clipboard)
        paste.type = "text/plain"
        paste.string = clipboard.getData("text/plain")
        @delegate?.inputControllerWillPaste(paste)
        @setInputSummary(textAdded: paste.string, didDelete: @selectionIsExpanded())
        @responder?.insertString(paste.string)
        @requestRender()
        @delegate?.inputControllerDidPaste(paste)

      else if html = clipboard.getData("text/html")
        paste.type = "text/html"
        paste.html = html
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertHTML(paste.html)
        @requestRender()
        @delegate?.inputControllerDidPaste(paste)

      else if "Files" in clipboard.types
        if file = clipboard.items?[0]?.getAsFile?()
          if not file.name and extension = extensionForFile(file)
            file.name = "pasted-file-#{++pastedFileCount}.#{extension}"
          paste.type = "File"
          paste.file = file
          @delegate?.inputControllerWillAttachFiles()
          @responder?.insertFile(paste.file)
          @requestRender()
          @delegate?.inputControllerDidPaste(paste)

      event.preventDefault()

    compositionstart: (event) ->
      @getCompositionInput().start(event.data)

    compositionupdate: (event) ->
      @getCompositionInput().update(event.data)

    compositionend: (event) ->
      @getCompositionInput().end(event.data)

    beforeinput: (event) ->
      @inputSummary.didInput = true

    input: (event) ->
      @inputSummary.didInput = true
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
      if @responder?.canIncreaseNestingLevel()
        @responder?.increaseNestingLevel()
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
        @requestRender()
        event.preventDefault()

      tab: (event) ->
        if @responder?.canDecreaseNestingLevel()
          @responder?.decreaseNestingLevel()
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

  getCompositionInput: ->
    if @isComposing()
      @compositionInput
    else
      @compositionInput = new CompositionInput this

  isComposing: ->
    @compositionInput? and not @compositionInput.isEnded()

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
    selectedRange = @getSelectedRange()

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
      Trix.removeNode(element)
      @setSelectedRange(selectedRange)
      callback(html)

  @proxyMethod "responder?.getSelectedRange"
  @proxyMethod "responder?.setSelectedRange"
  @proxyMethod "responder?.expandSelectionInDirection"
  @proxyMethod "responder?.selectionIsInCursorTarget"
  @proxyMethod "responder?.selectionIsExpanded"

extensionForFile = (file) ->
  file.type?.match(/\/(\w+)$/)?[1]

hasStringCodePointAt = " ".codePointAt?(0)?

stringFromKeyEvent = (event) ->
  if event.key and hasStringCodePointAt and event.key.codePointAt(0) is event.keyCode
    event.key
  else
    if event.which is null
      code = event.keyCode
    else if event.which isnt 0 and event.charCode isnt 0
      code = event.charCode

    if code? and keyNames[code] isnt "escape"
      Trix.UTF16String.fromCodepoints([code]).toString()

pasteEventIsCrippledSafariHTMLPaste = (event) ->
  if paste = event.clipboardData
    if "text/html" in paste.types
      # Answer is yes if there's any possibility of Paste and Match Style in Safari,
      # which is nearly impossible to detect confidently: https://bugs.webkit.org/show_bug.cgi?id=174165
      for type in paste.types
        hasPasteboardFlavor = /^CorePasteboardFlavorType/.test(type)
        hasReadableDynamicData = /^dyn\./.test(type) and paste.getData(type)
        mightBePasteAndMatchStyle = hasPasteboardFlavor or hasReadableDynamicData
        return true if mightBePasteAndMatchStyle
      false
    else
      isExternalHTMLPaste = "com.apple.webarchive" in paste.types
      isExternalRichTextPaste = "com.apple.flat-rtfd" in paste.types
      isExternalHTMLPaste or isExternalRichTextPaste

class CompositionInput extends Trix.BasicObject
  constructor: (@inputController) ->
    {@responder, @delegate, @inputSummary} = @inputController
    @data = {}

  start: (data) ->
    @data.start = data

    if @isSignificant()
      if @inputSummary.eventName is "keypress" and @inputSummary.textAdded
        @responder?.deleteInDirection("left")

      unless @selectionIsExpanded()
        @insertPlaceholder()
        @requestRender()

      @range = @responder?.getSelectedRange()

  update: (data) ->
    @data.update = data

    if @isSignificant()
      if range = @selectPlaceholder()
        @forgetPlaceholder()
        @range = range

  end: (data) ->
    @data.end = data

    if @isSignificant()
      @forgetPlaceholder()

      if @canApplyToDocument()
        @setInputSummary(preferDocument: true, didInput: false)
        @delegate?.inputControllerWillPerformTyping()
        @responder?.setSelectedRange(@range)
        @responder?.insertString(@data.end)
        @responder?.setSelectedRange(@range[0] + @data.end.length)

      else if @data.start? or @data.update?
        @requestReparse()
        @inputController.reset()
    else
      @inputController.reset()

  getEndData: ->
    @data.end

  isEnded: ->
    @getEndData()?

  isSignificant: ->
    if browser.composesExistingText
      @inputSummary.didInput
    else
      true

  # Private

  canApplyToDocument: ->
    @data.start?.length is 0 and @data.end?.length > 0 and @range?

  @proxyMethod "inputController.setInputSummary"
  @proxyMethod "inputController.requestRender"
  @proxyMethod "inputController.requestReparse"
  @proxyMethod "responder?.selectionIsExpanded"
  @proxyMethod "responder?.insertPlaceholder"
  @proxyMethod "responder?.selectPlaceholder"
  @proxyMethod "responder?.forgetPlaceholder"
