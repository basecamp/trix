#= require trix/controllers/abstract_input_controller

{objectsAreEqual, compact, summarizeStringChange} = Trix

class Trix.Level2InputController extends Trix.AbstractInputController
  mutationIsExpected: (mutationSummary) ->
    result = objectsAreEqual(mutationSummary, @inputSummary)
    console.log("[mutation] [#{if result then "expected" else "unexpected"}] #{JSON.stringify({mutationSummary})}")
    delete @inputSummary
    result

  events:
    beforeinput: (event) ->
      @inputSummary = compact(@[event.inputType]?(event))
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
    textDeleted = getTargetText(event)
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
    textDeleted = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.offsetSelectedRange(-textDeleted.length)
    @responder?.deleteInDirection("backward")
    {textDeleted}

  deleteWordForward: (event) ->
    textDeleted = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.offsetSelectedRange(textDeleted.length)
    @responder?.deleteInDirection("forward")
    {textDeleted}

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
    textAdded = "\n"
    textDeleted = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(textAdded)
    {textAdded, textDeleted}

  insertLink: (event) ->

  insertOrderedList: (event) ->

  insertParagraph: (event) ->
    textAdded = "\n"
    textDeleted = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertLineBreak()
    {textAdded, textDeleted}

  insertReplacementText: (event) ->
    oldText = getTargetText(event)
    newText = event.dataTransfer.getData("text/plain")
    @delegate?.inputControllerWillPerformTyping()
    @responder?.offsetSelectedRange(-oldText.length)
    @responder?.insertString(newText)
    {added, removed} = summarizeStringChange(oldText, newText)
    {textAdded: added, textDeleted: removed}

  insertText: (event) ->
    textAdded = event.data
    textDeleted = getTargetText(event)
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(textAdded)
    {textAdded, textDeleted}

  insertTranspose: (event) ->

  insertUnorderedList: (event) ->

  # Private

  toggleAttribute: (attributeName) ->
    @delegate?.inputControllerWillPerformFormatting()
    @responder?.toggleCurrentAttribute(attributeName)
    @requestRender()
    {}

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
