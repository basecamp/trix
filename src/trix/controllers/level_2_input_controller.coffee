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

  insertText: (event) ->
    textAdded = event.data
    @delegate?.inputControllerWillPerformTyping()
    @responder?.insertString(textAdded)
    {textAdded}

  deleteContentBackward: (event) ->
    textDeleted = [event.getTargetRanges()...].map(staticRangeToRange).join("")
    @delegate?.inputControllerWillPerformTyping()
    @responder?.deleteInDirection("backward")
    {textDeleted}

staticRangeToRange = (staticRange) ->
  range = document.createRange()
  range.setStart(staticRange.startContainer, staticRange.startOffset)
  range.setEnd(staticRange.endContainer, staticRange.endOffset)
  range
