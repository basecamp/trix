trix.testGroup "Custom element API", template: "editor_empty", ->
  trix.test "files are accepted by default", ->
    getComposition().insertFile(trix.createFile())
    equal getComposition().getAttachments().length, 1

  trix.test "rejecting a file by canceling the trix-file-accept event", ->
    getEditorElement().addEventListener "trix-file-accept", (event) -> event.preventDefault()
    getComposition().insertFile(trix.createFile())
    equal getComposition().getAttachments().length, 0

  trix.test "element triggers attachment events", ->
    file = trix.createFile()
    element = getEditorElement()
    composition = getComposition()
    attachment = null
    events = []

    element.addEventListener "trix-file-accept", (event) ->
      events.push(event.type)
      ok file is event.file

    element.addEventListener "trix-attachment-add", (event) ->
      events.push(event.type)
      attachment = event.attachment

    composition.insertFile(file)
    deepEqual events, ["trix-file-accept", "trix-attachment-add"]

    element.addEventListener "trix-attachment-remove", (event) ->
      events.push(event.type)
      ok attachment is event.attachment

    attachment.remove()
    deepEqual events, ["trix-file-accept", "trix-attachment-add", "trix-attachment-remove"]

  trix.test "element triggers trix-change when an attachment is edited", ->
    file = trix.createFile()
    element = getEditorElement()
    composition = getComposition()
    attachment = null
    events = []

    element.addEventListener "trix-attachment-add", (event) ->
      attachment = event.attachment

    composition.insertFile(file)

    element.addEventListener "trix-attachment-edit", (event) ->
      events.push(event.type)

    element.addEventListener "trix-change", (event) ->
      events.push(event.type)

    attachment.setAttributes(width: 9876)
    deepEqual events, ["trix-attachment-edit", "trix-change"]

  trix.test "element triggers trix-change events when the document changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-change", (event) -> eventCount++

    trix.typeCharacters "a", ->
      equal eventCount, 1
      trix.moveCursor "left", ->
        equal eventCount, 1
        trix.typeCharacters "bcd", ->
          equal eventCount, 4
          trix.clickToolbarButton action: "undo", ->
            equal eventCount, 5
            done()

  trix.test "element triggers trix-selection-change events when the location range changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-selection-change", (event) -> eventCount++

    trix.typeCharacters "a", ->
      equal eventCount, 1
      trix.moveCursor "left", ->
        equal eventCount, 2
        done()

  trix.test "only triggers trix-selection-change events on the active element", (done) ->
    elementA = getEditorElement()
    elementB = document.createElement("trix-editor")
    elementA.parentNode.insertBefore(elementB, elementA.nextSibling)

    elementB.addEventListener "trix-initialize", ->
      elementA.editor.insertString("a")
      elementB.editor.insertString("b")
      rangy.getSelection().removeAllRanges()

      eventCountA = 0
      eventCountB = 0
      elementA.addEventListener "trix-selection-change", (event) -> eventCountA++
      elementB.addEventListener "trix-selection-change", (event) -> eventCountB++

      elementA.editor.setSelectedRange(0)
      equal eventCountA, 1
      equal eventCountB, 0

      elementB.editor.setSelectedRange(0)
      equal eventCountA, 1
      equal eventCountB, 1

      elementA.editor.setSelectedRange(1)
      equal eventCountA, 2
      equal eventCountB, 1
      done()

  trix.test "element triggers toolbar dialog events", (done) ->
    element = getEditorElement()
    events = []

    element.addEventListener "trix-toolbar-dialog-show", (event) ->
      events.push(event.type)

    element.addEventListener "trix-toolbar-dialog-hide", (event) ->
      events.push(event.type)

    trix.clickToolbarButton action: "link", ->
      trix.typeInToolbarDialog "http://example.com", attribute: "href", ->
        trix.defer ->
          deepEqual events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]
          done()

  trix.test "element triggers paste event with position range", (done) ->
    element = getEditorElement()
    eventCount = 0
    range = null

    element.addEventListener "trix-paste", (event) ->
      eventCount++
      {range} = event

    trix.typeCharacters "", ->
      trix.pasteContent "text/html", "<strong>hello</strong>", ->
        equal eventCount, 1
        ok Trix.rangesAreEqual([5, 5], range)
        done()

  trix.test "element triggers attribute change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    attributes = null

    element.addEventListener "trix-attributes-change", (event) ->
      eventCount++
      {attributes} = event

    trix.typeCharacters "", ->
      equal eventCount, 0
      trix.clickToolbarButton attribute: "bold", ->
        equal eventCount, 1
        deepEqual { bold: true }, attributes
        done()

  trix.test "element triggers action change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    actions = null

    element.addEventListener "trix-actions-change", (event) ->
      eventCount++
      {actions} = event

    trix.typeCharacters "", ->
      equal eventCount, 0
      trix.clickToolbarButton attribute: "bullet", ->
        equal eventCount, 1
        equal actions.decreaseBlockLevel, true
        equal actions.increaseBlockLevel, false
        done()

  trix.test "element triggers custom focus and blur events", (done) ->
    element = getEditorElement()

    focusEventCount = 0
    blurEventCount = 0
    element.addEventListener "trix-focus", -> focusEventCount++
    element.addEventListener "trix-blur", -> blurEventCount++

    trix.triggerEvent(element, "blur")
    trix.defer ->
      equal blurEventCount, 1
      equal focusEventCount, 0

      trix.triggerEvent(element, "focus")
      trix.defer ->
        equal blurEventCount, 1
        equal focusEventCount, 1

        trix.insertImageAttachment()
        trix.after 20, ->
          trix.clickElement element.querySelector("figure"), ->
            trix.clickElement element.querySelector("figcaption"), ->
              trix.defer ->
                equal document.activeElement, element.querySelector("textarea")
                equal blurEventCount, 1
                equal focusEventCount, 1
                done()

  trix.test "editor resets to its original value on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form

    trix.typeCharacters "hello", ->
      form.reset()
      expectDocument("\n")

  trix.test "editor resets to last-set value on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form

    element.value = "hi"
    trix.typeCharacters "hello", ->
      form.reset()
      expectDocument("hi\n")

  trix.test "editor respects preventDefault on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form
    preventDefault = (event) -> event.preventDefault()

    trix.typeCharacters "hello", ->
      form.addEventListener("reset", preventDefault, false)
      form.reset()
      form.removeEventListener("reset", preventDefault, false)
      expectDocument("hello\n")
