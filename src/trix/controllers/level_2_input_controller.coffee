#= require trix/controllers/abstract_input_controller

{objectsAreEqual} = Trix

class Trix.Level2InputController extends Trix.AbstractInputController
  mutationIsExpected: (mutationSummary) ->
    result = objectsAreEqual(mutationSummary, @inputSummary)
    console.log("[mutation] [#{if result then "expected" else "unexpected"}] #{JSON.stringify({mutationSummary})}")
    delete @inputSummary
    result

  events:
    beforeinput: (event) ->
      @inputSummary = @[event.inputType]?(event)
      console.group(event.inputType)
      console.log("[#{event.type}] #{JSON.stringify(event.data)} #{JSON.stringify({@inputSummary})}")

    input: (event) ->
      console.log("[#{event.type}] #{JSON.stringify(event.data)}")
      Promise.resolve().then(console.groupEnd)

  # https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes

  deleteByComposition: (event) ->

  deleteByCut: (event) ->

  deleteByDrag: (event) ->

  deleteCompositionText: (event) ->

  deleteContent: (event) ->

  deleteContentBackward: (event) ->
    textDeleted = [event.getTargetRanges()...].map(staticRangeToRange).join("")
    @delegate?.inputControllerWillPerformTyping()
    @responder?.deleteInDirection("backward")
    {textDeleted}

  deleteContentForward: (event) ->

  deleteEntireSoftLine: (event) ->

  deleteHardLineBackward: (event) ->

  deleteHardLineForward: (event) ->

  deleteSoftLineBackward: (event) ->

  deleteSoftLineForward: (event) ->

  deleteWordBackward: (event) ->

  deleteWordForward: (event) ->

  formatBackColor: (event) ->

  formatBold: (event) ->
    @toggleAttribute("bold")

  formatFontColor: (event) ->

  formatFontName: (event) ->

  formatIndent: (event) ->

  formatItalic: (event) ->
    @toggleAttribute("italic")

  formatJustifyCenter: (event) ->

  formatJustifyFull: (event) ->

  formatJustifyLeft: (event) ->

  formatJustifyRight: (event) ->

  formatOutdent: (event) ->

  formatRemove: (event) ->

  formatSetBlockTextDirection: (event) ->

  formatSetInlineTextDirection: (event) ->

  formatStrikeThrough: (event) ->
    @toggleAttribute("strike")

  formatSubscript: (event) ->

  formatSuperscript: (event) ->

  formatUnderline: (event) ->

  historyRedo: (event) ->

  historyUndo: (event) ->

  insertCompositionText: (event) ->

  insertFromComposition: (event) ->

  insertFromDrop: (event) ->

  insertFromPaste: (event) ->

  insertFromYank: (event) ->

  insertHorizontalRule: (event) ->

  insertLineBreak: (event) ->

  insertLink: (event) ->

  insertOrderedList: (event) ->

  insertParagraph: (event) ->

  insertReplacementText: (event) ->

  insertText: (event) ->
    textAdded = event.data
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(textAdded)
    {textAdded}

  insertTranspose: (event) ->

  insertUnorderedList: (event) ->

  # Private

  toggleAttribute: (attributeName) ->
    @delegate?.inputControllerWillPerformFormatting()
    @responder?.toggleCurrentAttribute(attributeName)
    @requestRender()
    {}

staticRangeToRange = (staticRange) ->
  range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  range
