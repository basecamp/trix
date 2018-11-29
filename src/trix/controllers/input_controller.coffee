#= require trix/controllers/abstract_input_controller

{dataTransferIsPlainText} = Trix

class Trix.InputController extends Trix.AbstractInputController
  mutationIsExpected: (mutationSummary) ->
    expected = @handledInput
    @handledInput = false
    console.log("unexpected mutation! #{JSON.stringify(mutationSummary)}") unless expected
    expected

  mutationIsSignificant: ->
    not @composing

  events:
    beforeinput: (event) ->
      @handledInput = false
      if handler = @inputTypes[event.inputType]
        @handledInput = true
        updateSelectionForEvent(event)
        handler.call(this, event)
        @requestRender() if event.defaultPrevented

    input: (event) ->
      updateSelectionForEvent(event)

    compositionend: (event) ->
      if @composing
        @composing = false
        @requestRender()

  inputTypes:
    deleteByComposition: (event) ->
      @responder?.deleteInDirection("backward")

    deleteByCut: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    # deleteByDrag: (event) ->

    deleteCompositionText: (event) ->
      @responder?.deleteInDirection("backward")

    deleteContent: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteContentBackward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteContentForward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteEntireSoftLine: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteHardLineBackward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteHardLineForward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteSoftLineBackward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteSoftLineForward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    deleteWordBackward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("backward")

    deleteWordForward: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.deleteInDirection("forward")

    formatBackColor: (event) ->
      event.preventDefault()
      @activateAttributeIfSupported("backgroundColor", event.data)

    formatBold: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("bold")

    formatFontColor: (event) ->
      event.preventDefault()
      @activateAttributeIfSupported("color", event.data)

    formatFontName: (event) ->
      event.preventDefault()
      @activateAttributeIfSupported("font", event.data)

    formatIndent: (event) ->
      event.preventDefault()
      if @responder?.canIncreaseNestingLevel()
        @responder?.increaseNestingLevel()

    formatItalic: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("italic")

    formatJustifyCenter: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("justifyCenter")

    formatJustifyFull: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("justifyFull")

    formatJustifyLeft: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("justifyLeft")

    formatJustifyRight: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("justifyRight")

    formatOutdent: (event) ->
      event.preventDefault()
      if @responder?.canDecreaseNestingLevel()
        @responder?.decreaseNestingLevel()

    formatRemove: (event) ->
      event.preventDefault()
      for attributeName of @responder?.getCurrentAttributes()
        @responder?.removeCurrentAttribute(attributeName)

    formatSetBlockTextDirection: (event) ->
      event.preventDefault()
      @activateAttributeIfSupported("blockDir", event.data)

    formatSetInlineTextDirection: (event) ->
      event.preventDefault()
      @activateAttributeIfSupported("textDir", event.data)

    formatStrikeThrough: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("strike")

    formatSubscript: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("sub")

    formatSuperscript: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("sup")

    formatUnderline: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("underline")

    historyRedo: (event) ->
      @delegate?.inputControllerWillPerformRedo()

    historyUndo: (event) ->
      @delegate?.inputControllerWillPerformUndo()

    insertCompositionText: (event) ->
      @composing = true
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.data)

    insertFromComposition: (event) ->
      @composing = false
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.data)

    # insertFromDrop: (event) ->

    insertFromPaste: (event) ->
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

    insertFromYank: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.data)

    # insertHorizontalRule: (event) ->

    insertLineBreak: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString("\n")

    # insertLink: (event) ->

    insertOrderedList: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("number")

    insertParagraph: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertLineBreak()

    insertReplacementText: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.dataTransfer.getData("text/plain"))

    insertText: (event) ->
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.data)

    insertTranspose: (event) ->
      event.preventDefault()
      @delegate?.inputControllerWillPerformTyping()
      @responder?.insertString(event.data)

    insertUnorderedList: (event) ->
      event.preventDefault()
      @toggleAttributeIfSupported("bullet")

  toggleAttributeIfSupported: (attributeName) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @responder?.toggleCurrentAttribute(attributeName)

  activateAttributeIfSupported: (attributeName, value) ->
    if attributeName in Trix.getAllAttributeNames()
      @delegate?.inputControllerWillPerformFormatting()
      @responder?.setCurrentAttribute(attributeName, value)

updateSelectionForEvent = (event) ->
  if domRange = getDOMRangeForEvent(event)
    Trix.setDOMRange(domRange)
  else
    Trix.selectionChangeObserver.reset()

getDOMRangeForEvent = (event) ->
  if targetRanges = event.getTargetRanges?()
    if targetRanges.length
      staticRangeToRange(targetRanges[0])

staticRangeToRange = (staticRange) ->
  range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  range
