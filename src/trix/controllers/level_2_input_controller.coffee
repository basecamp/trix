#= require trix/controllers/abstract_input_controller

class Trix.Level2InputController extends Trix.AbstractInputController
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
      if @[event.inputType]
        @handledInput = true
        updateSelectionForEvent(event)
        @[event.inputType](event)
        @requestRender() if event.defaultPrevented

    input: (event) ->
      updateSelectionForEvent(event)

    compositionend: (event) ->
      @composing = false

  # https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes

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

  # formatBackColor: (event) ->

  formatBold: (event) ->
    event.preventDefault()
    @delegate?.inputControllerWillPerformFormatting()
    @responder?.toggleCurrentAttribute("bold")

  # formatFontColor: (event) ->
  #
  # formatFontName: (event) ->
  #
  # formatIndent: (event) ->

  formatItalic: (event) ->
    event.preventDefault()
    @delegate?.inputControllerWillPerformFormatting()
    @responder?.toggleCurrentAttribute("italic")

  # formatJustifyCenter: (event) ->
  #
  # formatJustifyFull: (event) ->
  #
  # formatJustifyLeft: (event) ->
  #
  # formatJustifyRight: (event) ->
  #
  # formatOutdent: (event) ->
  #
  # formatRemove: (event) ->
  #
  # formatSetBlockTextDirection: (event) ->
  #
  # formatSetInlineTextDirection: (event) ->

  formatStrikeThrough: (event) ->
    event.preventDefault()
    @delegate?.inputControllerWillPerformFormatting()
    @responder?.toggleCurrentAttribute("strike")

  # formatSubscript: (event) ->
  #
  # formatSuperscript: (event) ->
  #
  # formatUnderline: (event) ->
  #
  # historyRedo: (event) ->
  #
  # historyUndo: (event) ->

  insertCompositionText: (event) ->
    @composing = true
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(event.data)

  insertFromComposition: (event) ->
    @composing = false
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(event.data)

  # insertFromDrop: (event) ->
  #
  # insertFromPaste: (event) ->
  #
  # insertFromYank: (event) ->
  #
  # insertHorizontalRule: (event) ->

  insertLineBreak: (event) ->
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString("\n")

  # insertLink: (event) ->
  #
  # insertOrderedList: (event) ->

  insertParagraph: (event) ->
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertLineBreak()

  insertReplacementText: (event) ->
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(event.dataTransfer.getData("text/plain"))

  insertText: (event) ->
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(event.data)

  # insertTranspose: (event) ->
  #
  # insertUnorderedList: (event) ->

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
