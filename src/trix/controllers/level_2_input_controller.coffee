#= require trix/controllers/abstract_input_controller

{objectsAreEqual, compact, summarizeStringChange} = Trix

class Trix.Level2InputController extends Trix.AbstractInputController
  mutationIsExpected: (mutationSummary) ->
    expected = @handledInput
    @handledInput = false
    console.log("unexpected mutation! #{JSON.stringify(mutationSummary)}") unless expected
    expected

  mutationIsSignificant: ->
    not @composition?

  events:
    beforeinput: (event) ->
      @handledInput = false
      if @[event.inputType]
        @handledInput = true
        @[event.inputType](event)
        @requestRender() if event.defaultPrevented

    compositionend: (event) ->
      if @composition?
        string = @composition
        delete @composition
        @delegate?.inputControllerWillPerformTyping()
        @responder?.expandSelectionInDirection("backward", length: string.length)
        @responder?.insertString(string)
        @requestRender()

  # https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes

  # deleteByComposition: (event) ->
  #
  # deleteByCut: (event) ->
  #
  # deleteByDrag: (event) ->

  deleteCompositionText: (event) ->
    @composition = ""

  # deleteContent: (event) ->

  deleteContentBackward: (event) ->
    {length} = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.deleteInDirection("backward", {length})

  # deleteContentForward: (event) ->
  #
  # deleteEntireSoftLine: (event) ->
  #
  # deleteHardLineBackward: (event) ->
  #
  # deleteHardLineForward: (event) ->
  #
  # deleteSoftLineBackward: (event) ->
  #
  # deleteSoftLineForward: (event) ->

  deleteWordBackward: (event) ->
    {length} = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.deleteInDirection("backward", {length})

  deleteWordForward: (event) ->
    {length} = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.deleteInDirection("forward", {length})

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
    @composition = event.data

  insertFromComposition: (event) ->
    delete @composition
    @insertReplacementText(event)

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
    string = event.data ? event.dataTransfer.getData("text/plain")
    {length} = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.expandSelectionInDirection("backward", {length})
    @responder?.insertString(string)

  insertText: (event) ->
    string = event.data
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(string)

  # insertTranspose: (event) ->
  #
  # insertUnorderedList: (event) ->

getTargetText = (event) ->
  [event.getTargetRanges()...]
    .map(staticRangeToRange)
    .map(rangeToText)
    .join("")

staticRangeToRange = (staticRange) ->
  range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  range

rangeToText = (range) ->
  return "" if range.collapsed
  element = document.createElement("div")
  element.appendChild(range.cloneContents())
  element.innerText
