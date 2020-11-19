#= require trix/controllers/input_controller

{dataTransferIsPlainText, keyEventIsKeyboardCommand, objectsAreEqual} = Trix

class Trix.Level2InputController extends Trix.InputController
  elementDidMutate: ->
    if @scheduledRender
      @delegate?.inputControllerDidAllowUnhandledInput?() if @composing
    else
      @reparse()

  scheduleRender: ->
    @scheduledRender ?= requestAnimationFrame(@render)

  render: =>
    cancelAnimationFrame(@scheduledRender)
    @scheduledRender = null
    @delegate?.render() unless @composing
    @afterRender?()
    @afterRender = null

  reparse: ->
    @delegate?.reparse()

  events:
    keydown: (event) ->
      if keyEventIsKeyboardCommand(event)
        command = keyboardCommandFromKeyEvent(event)
        if @delegate?.inputControllerDidReceiveKeyboardCommand(command)
          event.preventDefault()
      else
        name = event.key
        name += "+Alt" if event.altKey
        name += "+Shift" if event.shiftKey
        if handler = @keys[name]
          @withEvent(event, handler)

    # Handle paste event to work around beforeinput.insertFromPaste browser bugs.
    # Safe to remove each condition once fixed upstream.
    paste: (event) ->
      # https://bugs.webkit.org/show_bug.cgi?id=194921
      if pasteEventHasFilesOnly(event)
        event.preventDefault()
        @attachFiles(event.clipboardData.files)

      # https://bugs.chromium.org/p/chromium/issues/detail?id=934448
      else if pasteEventHasPlainTextOnly(event)
        event.preventDefault()
        paste =
          type: "text/plain"
          string: event.clipboardData.getData("text/plain")
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertString(paste.string)
        @render()
        @delegate?.inputControllerDidPaste(paste)

      # https://bugs.webkit.org/show_bug.cgi?id=196702
      else if href = event.clipboardData?.getData("URL")
        event.preventDefault()
        paste =
          type: "text/html"
          html: @createLinkHTML(href)
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertHTML(paste.html)
        @render()
        @delegate?.inputControllerDidPaste(paste)

    beforeinput: (event) ->
      if handler = @inputTypes[event.inputType]
        @withEvent(event, handler)
        @scheduleRender()

    input: (event) ->
      Trix.selectionChangeObserver.reset()

    dragstart: (event) ->
      if @responder?.selectionContainsAttachments()
        event.dataTransfer.setData("application/x-trix-dragging", true)
        @dragging =
          range: @responder?.getSelectedRange()
          point: pointFromEvent(event)

    dragenter: (event) ->
      if dragEventHasFiles(event)
        event.preventDefault()

    dragover: (event) ->
      if @dragging
        event.preventDefault()
        point = pointFromEvent(event)
        unless objectsAreEqual(point, @dragging.point)
          @dragging.point = point
          @responder?.setLocationRangeFromPointRange(point)

      else if dragEventHasFiles(event)
        event.preventDefault()

    drop: (event) ->
      if @dragging
        event.preventDefault()
        @delegate?.inputControllerWillMoveText()
        @responder?.moveTextFromRange(@dragging.range)
        @dragging = null
        @scheduleRender()

      else if dragEventHasFiles(event)
        event.preventDefault()
        point = pointFromEvent(event)
        @responder?.setLocationRangeFromPointRange(point)
        @attachFiles(event.dataTransfer.files)

    dragend: ->
      if @dragging
        @responder?.setSelectedRange(@dragging.range)
        @dragging = null

    compositionend: (event) ->
      if @composing
        @composing = false
        @scheduleRender()

  keys:
    ArrowLeft: ->
      if @responder?.shouldManageMovingCursorInDirection("backward")
        @event.preventDefault()
        @responder?.moveCursorInDirection("backward")

    ArrowRight: ->
      if @responder?.shouldManageMovingCursorInDirection("forward")
        @event.preventDefault()
        @responder?.moveCursorInDirection("forward")

    Backspace: ->
      if @responder?.shouldManageDeletingInDirection("backward")
        @event.preventDefault()
        @delegate?.inputControllerWillPerformTyping()
        @responder?.deleteInDirection("backward")
        @render()

    Tab: ->
      if @responder?.canIncreaseNestingLevel()
        @event.preventDefault()
        @responder?.increaseNestingLevel()
        @render()

    "Tab+Shift": ->
      if @responder?.canDecreaseNestingLevel()
        @event.preventDefault()
        @responder?.decreaseNestingLevel()
        @render()

  inputTypes:
    deleteByComposition: ->
      @deleteInDirection("backward", recordUndoEntry: false)

    deleteByCut: ->
      @deleteInDirection("backward")

    deleteByDrag: ->
      @event.preventDefault()
      @withTargetDOMRange ->
        @deleteByDragRange = @responder?.getSelectedRange()

    deleteCompositionText: ->
      @deleteInDirection("backward", recordUndoEntry: false)

    deleteContent: ->
      @deleteInDirection("backward")

    deleteContentBackward: ->
      @deleteInDirection("backward")

    deleteContentForward: ->
      @deleteInDirection("forward")

    deleteEntireSoftLine: ->
      @deleteInDirection("forward")

    deleteHardLineBackward: ->
      @deleteInDirection("backward")

    deleteHardLineForward: ->
      @deleteInDirection("forward")

    deleteSoftLineBackward: ->
      @deleteInDirection("backward")

    deleteSoftLineForward: ->
      @deleteInDirection("forward")

    deleteWordBackward: ->
      @deleteInDirection("backward")

    deleteWordForward: ->
      @deleteInDirection("forward")

    formatBackColor: ->
      @activateAttributeIfSupported("backgroundColor", @event.data)

    formatBold: ->
      @toggleAttributeIfSupported("bold")

    formatFontColor: ->
      @activateAttributeIfSupported("color", @event.data)

    formatFontName: ->
      @activateAttributeIfSupported("font", @event.data)

    formatIndent: ->
      if @responder?.canIncreaseNestingLevel()
        @withTargetDOMRange ->
          @responder?.increaseNestingLevel()

    formatItalic: ->
      @toggleAttributeIfSupported("italic")

    formatJustifyCenter: ->
      @toggleAttributeIfSupported("justifyCenter")

    formatJustifyFull: ->
      @toggleAttributeIfSupported("justifyFull")

    formatJustifyLeft: ->
      @toggleAttributeIfSupported("justifyLeft")

    formatJustifyRight: ->
      @toggleAttributeIfSupported("justifyRight")

    formatOutdent: ->
      if @responder?.canDecreaseNestingLevel()
        @withTargetDOMRange ->
          @responder?.decreaseNestingLevel()

    formatRemove: ->
      @withTargetDOMRange ->
        for attributeName of @responder?.getCurrentAttributes()
          @responder?.removeCurrentAttribute(attributeName)

    formatSetBlockTextDirection: ->
      @activateAttributeIfSupported("blockDir", @event.data)

    formatSetInlineTextDirection: ->
      @activateAttributeIfSupported("textDir", @event.data)

    formatStrikeThrough: ->
      @toggleAttributeIfSupported("strike")

    formatSubscript: ->
      @toggleAttributeIfSupported("sub")

    formatSuperscript: ->
      @toggleAttributeIfSupported("sup")

    formatUnderline: ->
      @toggleAttributeIfSupported("underline")

    historyRedo: ->
      @delegate?.inputControllerWillPerformRedo()

    historyUndo: ->
      @delegate?.inputControllerWillPerformUndo()

    insertCompositionText: ->
      @composing = true
      @insertString(@event.data)

    insertFromComposition: ->
      @composing = false
      @insertString(@event.data)

    insertFromDrop: ->
      if range = @deleteByDragRange
        @deleteByDragRange = null
        @delegate?.inputControllerWillMoveText()
        @withTargetDOMRange ->
          @responder?.moveTextFromRange(range)

    insertFromPaste: ->
      {dataTransfer} = @event
      paste = {dataTransfer}

      if href = dataTransfer.getData("URL")
        @event.preventDefault()
        paste.type = "text/html"
        if name = dataTransfer.getData("public.url-name")
          string = Trix.squishBreakableWhitespace(name).trim()
        else
          string = href
        paste.html = @createLinkHTML(href, string)
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertHTML(paste.html)
        @afterRender = =>
          @delegate?.inputControllerDidPaste(paste)

      else if dataTransferIsPlainText(dataTransfer)
        paste.type = "text/plain"
        paste.string = dataTransfer.getData("text/plain")
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertString(paste.string)
        @afterRender = =>
          @delegate?.inputControllerDidPaste(paste)

      else if html = dataTransfer.getData("text/html")
        @event.preventDefault()
        paste.type = "text/html"
        paste.html = html
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertHTML(paste.html)
        @afterRender = =>
          @delegate?.inputControllerDidPaste(paste)

      else if dataTransfer.files?.length
        paste.type = "File"
        paste.file = dataTransfer.files[0]
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertFile(paste.file)
        @afterRender = =>
          @delegate?.inputControllerDidPaste(paste)

    insertFromYank: ->
      @insertString(@event.data)

    insertLineBreak: ->
      @insertString("\n")

    insertLink: ->
      @activateAttributeIfSupported("href", @event.data)

    insertOrderedList: ->
      @toggleAttributeIfSupported("number")

    insertParagraph: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertLineBreak()

    insertReplacementText: ->
      @insertString(@event.dataTransfer.getData("text/plain"), updatePosition: false)

    insertText: ->
      @insertString(@event.data ? @event.dataTransfer?.getData("text/plain"))

    insertTranspose: ->
      @insertString(@event.data)

    insertUnorderedList: ->
      @toggleAttributeIfSupported("bullet")

  # Responder helpers

  insertString: (string = "", options) ->
    @delegate?.inputControllerWillPerformTyping()
    @withTargetDOMRange ->
      @responder?.insertString(string, options)

  toggleAttributeIfSupported: (attributeName) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting(attributeName)
      @withTargetDOMRange ->
        @responder?.toggleCurrentAttribute(attributeName)

  activateAttributeIfSupported: (attributeName, value) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting(attributeName)
      @withTargetDOMRange ->
        @responder?.setCurrentAttribute(attributeName, value)

  deleteInDirection: (direction, {recordUndoEntry} = {recordUndoEntry: true}) ->
    @delegate?.inputControllerWillPerformTyping() if recordUndoEntry
    perform = => @responder?.deleteInDirection(direction)
    if domRange = @getTargetDOMRange(minLength: 2)
      @withTargetDOMRange(domRange, perform)
    else
      perform()

  # Selection helpers

  withTargetDOMRange: (domRange, fn) ->
    if typeof domRange is "function"
      fn = domRange
      domRange = @getTargetDOMRange()
    if domRange
      @responder?.withTargetDOMRange(domRange, fn.bind(this))
    else
      Trix.selectionChangeObserver.reset()
      fn.call(this)

  getTargetDOMRange: ({minLength} = {minLength: 0}) ->
    if targetRanges = @event.getTargetRanges?()
      if targetRanges.length
        domRange = staticRangeToRange(targetRanges[0])
        if minLength is 0 or domRange.toString().length >= minLength
          domRange

  staticRangeToRange = (staticRange) ->
    range = document.createRange()
    range.setStart(staticRange.startContainer, staticRange.startOffset)
    range.setEnd(staticRange.endContainer, staticRange.endOffset)
    range

  # Event helpers

  withEvent: (event, fn) ->
    @event = event
    try
      result = fn.call(this)
    finally
      @event = null
    result

  dragEventHasFiles = (event) ->
    "Files" in (event.dataTransfer?.types ? [])

  pasteEventHasFilesOnly = (event) ->
    if clipboard = event.clipboardData
      "Files" in clipboard.types and
        clipboard.types.length is 1 and
        clipboard.files.length >= 1

  pasteEventHasPlainTextOnly = (event) ->
    if clipboard = event.clipboardData
      "text/plain" in clipboard.types and
        clipboard.types.length is 1

  keyboardCommandFromKeyEvent = (event) ->
    command = []
    command.push("alt") if event.altKey
    command.push("shift") if event.shiftKey
    command.push(event.key)
    command

  pointFromEvent = (event) ->
    x: event.clientX
    y: event.clientY
