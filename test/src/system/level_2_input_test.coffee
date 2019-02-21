{assert, clickToolbarButton, defer, insertString, isToolbarButtonActive, selectAll, test, testIf, testGroup, triggerEvent, triggerInputEvent} = Trix.TestHelpers

test = ->
  testIf(Trix.config.input.getLevel() is 2, arguments...)

testOptions =
  template: "editor_empty"
  setup: ->
    addEventListener("beforeinput", recordInputEvent, true)
    addEventListener("input", recordInputEvent, true)
  teardown: ->
    removeEventListener("beforeinput", recordInputEvent, true)
    removeEventListener("input", recordInputEvent, true)

inputEvents = []

recordInputEvent = (event) ->
  # Not all browsers dispatch "beforeinput" event when calling execCommand() so
  # we manually dispatch a synthetic one. If a second one arrives, ignore it.
  if event.type is "beforeinput" and inputEvents.length is 1 and inputEvents[0].type is "beforeinput"
    event.stopImmediatePropagation()
  else
    {type, inputType, data} = event
    inputEvents.push({type, inputType, data})

# Borrowed from https://github.com/web-platform-tests/wpt/blob/master/input-events/input-events-exec-command.html
performInputTypeUsingExecCommand = (command, {inputType, data}, callback) ->
  inputEvents = []
  requestAnimationFrame ->
    triggerInputEvent(document.activeElement, "beforeinput", {inputType, data})
    document.execCommand(command, false, data)
    assert.equal(inputEvents.length, 2)
    assert.equal(inputEvents[0].type, "beforeinput")
    assert.equal(inputEvents[1].type, "input")
    assert.equal(inputEvents[0].inputType, inputType)
    assert.equal(inputEvents[0].data, data)
    requestAnimationFrame ->
      requestAnimationFrame(callback)

testGroup "Level 2 Input", testOptions, ->
  test "insertText", (expectDocument) ->
    performInputTypeUsingExecCommand "insertText", inputType: "insertText", data: "abc", ->
      expectDocument("abc\n")

  test "insertOrderedList", (expectDocument) ->
    insertString("abc")
    performInputTypeUsingExecCommand "insertOrderedList", inputType: "insertOrderedList", ->
      assert.blockAttributes([0, 4], ["numberList", "number"])
      assert.ok isToolbarButtonActive(attribute: "number")
      expectDocument("abc\n")

  test "insertUnorderedList", (expectDocument) ->
    insertString("abc")
    performInputTypeUsingExecCommand "insertUnorderedList", inputType: "insertUnorderedList", ->
      assert.blockAttributes([0, 4], ["bulletList", "bullet"])
      assert.ok isToolbarButtonActive(attribute: "bullet")
      expectDocument("abc\n")

  test "insertLineBreak", (expectDocument) ->
    clickToolbarButton attribute: "quote", ->
      insertString("abc")
      performInputTypeUsingExecCommand "insertLineBreak", inputType: "insertLineBreak", ->
        performInputTypeUsingExecCommand "insertLineBreak", inputType: "insertLineBreak", ->
          assert.blockAttributes([0, 6], ["quote"])
          expectDocument("abc\n\n\n")

  test "insertParagraph", (expectDocument) ->
    clickToolbarButton attribute: "quote", ->
      insertString("abc")
      performInputTypeUsingExecCommand "insertParagraph", inputType: "insertParagraph", ->
        performInputTypeUsingExecCommand "insertParagraph", inputType: "insertParagraph", ->
          assert.blockAttributes([0, 4], ["quote"])
          assert.blockAttributes([4, 5], [])
          expectDocument("abc\n\n")

  test "formatBold", (expectDocument) ->
    insertString("abc")
    getComposition().setSelectedRange([1, 2])
    performInputTypeUsingExecCommand "bold", inputType: "formatBold", ->
      assert.textAttributes([0, 1], {})
      assert.textAttributes([1, 2], bold: true)
      assert.textAttributes([2, 3], {})
      expectDocument("abc\n")

  test "formatItalic", (expectDocument) ->
    insertString("abc")
    getComposition().setSelectedRange([1, 2])
    performInputTypeUsingExecCommand "italic", inputType: "formatItalic", ->
      assert.textAttributes([0, 1], {})
      assert.textAttributes([1, 2], italic: true)
      assert.textAttributes([2, 3], {})
      expectDocument("abc\n")

  test "formatStrikeThrough", (expectDocument) ->
    insertString("abc")
    getComposition().setSelectedRange([1, 2])
    performInputTypeUsingExecCommand "strikeThrough", inputType: "formatStrikeThrough", ->
      assert.textAttributes([0, 1], {})
      assert.textAttributes([1, 2], strike: true)
      assert.textAttributes([2, 3], {})
      expectDocument("abc\n")
