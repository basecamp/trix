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
        @updateSelection()
        handler.call(this)

    input: (event) ->
      Trix.selectionChangeObserver.reset()

    compositionend: (event) ->
      if @composing
        @composing = false
        @requestRender()

  inputTypes:
    deleteByComposition: ->
      @responder?.deleteInDirection("backward")

    deleteByCut: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    # deleteByDrag: ->

    deleteCompositionText: ->
      @responder?.deleteInDirection("backward")

    deleteContent: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteContentBackward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteContentForward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteEntireSoftLine: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteHardLineBackward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteHardLineForward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteSoftLineBackward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteSoftLineForward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteWordBackward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteWordForward: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

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
        @responder?.decreaseNestingLevel()

    formatRemove: ->
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
      @responder?.insertString(@event.data)

    insertFromComposition: ->
      @composing = false
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(@event.data)

    # insertFromDrop: ->

    insertFromPaste: ->
      {dataTransfer} = event
      paste = {dataTransfer}

      if dataTransferIsPlainText(dataTransfer)
        paste.type = "text/plain"
        paste.string = clipboard.getData("text/plain")
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertString(paste.string)
        @delegate?.inputControllerDidPaste(paste)

      else if html = dataTransfer.getData("text/html")
        paste.type = "text/html"
        paste.html = html
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertHTML(paste.html)
        @delegate?.inputControllerDidPaste(paste)

      else if dataTransfer.files?.length
        paste.type = "File"
        paste.file = dataTransfer.files[0]
        @delegate?.inputControllerWillPaste(paste)
        @responder?.insertFile(paste.file)
        @delegate?.inputControllerDidPaste(paste)

    insertFromYank: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(@event.data)

    # insertHorizontalRule: ->

    insertLineBreak: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString("\n")

    # insertLink: ->

    insertOrderedList: ->
      @toggleAttributeIfSupported("number")

    insertParagraph: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertLineBreak()

    insertReplacementText: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(@event.dataTransfer.getData("text/plain"))

    insertText: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(@event.data)

    insertTranspose: ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(@event.data)

    insertUnorderedList: ->
      @toggleAttributeIfSupported("bullet")

  toggleAttributeIfSupported: (attributeName) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @responder?.toggleCurrentAttribute(attributeName)

  activateAttributeIfSupported: (attributeName, value) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @responder?.setCurrentAttribute(attributeName, value)

  updateSelection: ->
    if domRange = @getTargetDOMRange()
      Trix.setDOMRange(domRange)
    else
      Trix.selectionChangeObserver.reset()

  getTargetDOMRange: ->
    if targetRanges = @event.getTargetRanges?()
      if targetRanges.length
        staticRangeToRange(targetRanges[0])

staticRangeToRange = (staticRange) ->
  range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  range
