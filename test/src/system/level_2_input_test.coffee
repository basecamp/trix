{assert, after, clickToolbarButton, defer, insertString, insertNode, isToolbarButtonActive, selectAll, selectNode, test, testIf, testGroup, triggerEvent, triggerInputEvent, typeCharacters} = Trix.TestHelpers

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

  # https://input-inspector.now.sh/profiles/hVXS1cHYFvc2EfdRyTWQ
  test "correcting a misspelled word in Chrome", (expectDocument) ->
    insertString("onr")
    getComposition().setSelectedRange([0, 3])
    requestAnimationFrame ->
      inputType = "insertReplacementText"
      dataTransfer = createDataTransfer("text/plain": "one")
      event = createEvent("beforeinput", {inputType, dataTransfer})
      document.activeElement.dispatchEvent(event)
      requestAnimationFrame ->
        expectDocument "one\n"

  # https://input-inspector.now.sh/profiles/XsZVwKtFxakwnsNs0qnX
  test "correcting a misspelled word in Safari", (expectDocument) ->
    insertString("onr")
    getComposition().setSelectedRange([0, 3])
    requestAnimationFrame ->
      inputType = "insertText"
      dataTransfer = createDataTransfer("text/plain": "one", "text/html": "one")
      event = createEvent("beforeinput", {inputType, dataTransfer})
      document.activeElement.dispatchEvent(event)
      requestAnimationFrame ->
        expectDocument "one\n"

  # https://input-inspector.now.sh/profiles/yZlsrfG93QMzp2oyr0BE
  test "deleting the last character in a composed word on Android", (expectDocument) ->
    insertString("c")
    element = getEditorElement()
    textNode = element.firstChild.lastChild
    selectNode textNode, ->
      triggerInputEvent(element, "beforeinput", inputType: "insertCompositionText", data: "")
      triggerEvent(element, "compositionend", data: "")
      requestAnimationFrame ->
        expectDocument "\n"

  test "pasting a file", (expectDocument) ->
    createFile (file) ->
      clipboardData = createDataTransfer("Files": [file])
      dataTransfer = createDataTransfer("Files": [file])
      paste {clipboardData, dataTransfer}, ->
        attachments = getDocument().getAttachments()
        assert.equal attachments.length, 1
        assert.equal attachments[0].getFilename(), file.name
        expectDocument "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

  # "insertFromPaste InputEvent missing pasted files in dataTransfer"
  # - https://bugs.webkit.org/show_bug.cgi?id=194921
  test "pasting a file in Safari", (expectDocument) ->
    createFile (file) ->
      clipboardData = createDataTransfer("Files": [file])
      dataTransfer = createDataTransfer("text/html": """<img src="blob:#{location.origin}/531de8">""")
      paste {clipboardData, dataTransfer}, ->
        attachments = getDocument().getAttachments()
        assert.equal attachments.length, 1
        assert.equal attachments[0].getFilename(), file.name
        expectDocument "#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

  # "insertFromPaste InputEvent missing text/uri-list in dataTransfer for pasted links"
  # - https://bugs.webkit.org/show_bug.cgi?id=196702
  test "pasting a link in Safari", (expectDocument) ->
    createFile (file) ->
      url = "https://bugs.webkit.org"
      text = "WebKit Bugzilla"
      clipboardData = createDataTransfer("URL": url, "text/uri-list": url, "text/plain": text)
      dataTransfer = createDataTransfer("text/html": """<a href="#{url}">#{text}</a>""", "text/plain": text)
      paste {clipboardData, dataTransfer}, ->
        assert.textAttributes([0, url.length], href: url)
        expectDocument "#{url}\n"

  # Pastes from MS Word include an image of the copied text 🙃
  # https://input-inspector.now.sh/profiles/QWDITsV60dpEVl1SOZg8
  test "pasting text from MS Word", (expectDocument) ->
    createFile (file) ->
      clipboardData = dataTransfer = createDataTransfer
        "text/html": """<span class="MsoNormal">abc</span>"""
        "text/plain": "abc"
        "Files": [file]

      paste {dataTransfer}, ->
        attachments = getDocument().getAttachments()
        assert.equal attachments.length, 0
        expectDocument "abc\n"

  # "beforeinput" event is not fired for Paste and Match Style operations
  # - https://bugs.chromium.org/p/chromium/issues/detail?id=934448
  test "Paste and Match Style in Chrome", (expectDocument) ->
    done = -> expectDocument("a\n\nb\n\nc\n")
    typeCharacters "a\n\n", ->
      clipboardData = createDataTransfer("text/plain": "b\n\nc")
      pasteEvent = createEvent("paste", {clipboardData})
      if document.activeElement.dispatchEvent(pasteEvent)
        node = document.createElement("div")
        node.innerHTML = """<div>b</div><div><br></div><div>c</div>"""
        insertNode(node, done)
      else
        requestAnimationFrame(done)


createFile = (callback) ->
  canvas = document.createElement("canvas")
  canvas.toBlob (file) ->
    file.name = "image.png"
    callback(file)

createDataTransfer = (data = {}) ->
  types: (key for key of data)
  files: data.Files ? []
  getData: (type) -> data[type]

createEvent = (type, properties = {}) ->
  event = document.createEvent("Events")
  event.initEvent(type, true, true)
  for key, value of properties
    Object.defineProperty(event, key, {value})
  event

paste = ({dataTransfer, clipboardData} = {}, callback) ->
  pasteEvent = createEvent("paste", clipboardData: clipboardData || dataTransfer)
  inputEvent = createEvent("beforeinput", inputType: "insertFromPaste", dataTransfer: dataTransfer)
  if document.activeElement.dispatchEvent(pasteEvent)
    document.activeElement.dispatchEvent(inputEvent)
  after(60, callback)
