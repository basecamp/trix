#= require trix/controllers/input_controller

{dataTransferIsPlainText} = Trix

class Trix.Level2InputController extends Trix.InputController
  mutationIsExpected: (mutationSummary) ->
    expected = @event?
    @event = null
    console.log("unexpected mutation! #{JSON.stringify(mutationSummary)}") unless expected
    expected

  mutationIsSignificant: ->
    not @composing

  events:
    beforeinput: (event) ->
      @event = null
      if handler = @inputTypes[event.inputType]
        @event = event
        Trix.selectionChangeObserver.reset()
        handler.call(this)

    input: (event) ->
      Trix.selectionChangeObserver.reset()

    compositionend: (event) ->
      if @composing
        @composing = false
        @requestRender()

  inputTypes:
    deleteByComposition: ->
      @deleteInDirection("backward", recordUndoEntry: false)

    deleteByCut: ->
      @deleteInDirection("backward")

    # deleteByDrag: ->

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
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.data)

    insertFromComposition: ->
      @composing = false
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.data)

    # insertFromDrop: ->

    insertFromPaste: ->
      {dataTransfer} = event
      paste = {dataTransfer}

      if dataTransferIsPlainText(dataTransfer)
        paste.type = "text/plain"
        paste.string = dataTransfer.getData("text/plain")
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertString(paste.string)
        @delegate?.inputControllerDidPaste(paste)

      else if html = dataTransfer.getData("text/html")
        paste.type = "text/html"
        paste.html = html
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertHTML(paste.html)
        @delegate?.inputControllerDidPaste(paste)

      else if dataTransfer.files?.length
        paste.type = "File"
        paste.file = dataTransfer.files[0]
        @delegate?.inputControllerWillPaste(paste)
        @withTargetDOMRange ->
          @responder?.insertFile(paste.file)
        @delegate?.inputControllerDidPaste(paste)

    insertFromYank: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.data)

    # insertHorizontalRule: ->

    insertLineBreak: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString("\n")

    # insertLink: ->

    insertOrderedList: ->
      @toggleAttributeIfSupported("number")

    insertParagraph: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertLineBreak()

    insertReplacementText: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.dataTransfer.getData("text/plain"))

    insertText: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.data)

    insertTranspose: ->
      @delegate?.inputControllerWillPerformTyping()
      @withTargetDOMRange ->
        @responder?.insertString(@event.data)

    insertUnorderedList: ->
      @toggleAttributeIfSupported("bullet")

  # Responder helpers

  toggleAttributeIfSupported: (attributeName) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @withTargetDOMRange ->
        @responder?.toggleCurrentAttribute(attributeName)

  activateAttributeIfSupported: (attributeName, value) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @withTargetDOMRange ->
        @responder?.setCurrentAttribute(attributeName, value)

  deleteInDirection: (direction, {recordUndoEntry} = {recordUndoEntry: true}) ->
    @delegate?.inputControllerWillPerformTyping() if recordUndoEntry
    @withTargetDOMRange @getTargetDOMRange(minLength: 2), ->
      @responder?.deleteInDirection(direction)

  # Selection helpers

  withTargetDOMRange: (domRange, fn) ->
    if typeof domRange is "function"
      fn = domRange
      domRange = @getTargetDOMRange()
    Trix.withDOMRange(domRange, fn.bind(this))

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
