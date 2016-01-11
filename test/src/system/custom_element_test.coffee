trix.testGroup "Custom element API", template: "editor_empty", ->
  trix.test "files are accepted by default", ->
    getComposition().insertFile(trix.createFile())
    trix.assert.equal getComposition().getAttachments().length, 1

  trix.test "rejecting a file by canceling the trix-file-accept event", ->
    getEditorElement().addEventListener "trix-file-accept", (event) -> event.preventDefault()
    getComposition().insertFile(trix.createFile())
    trix.assert.equal getComposition().getAttachments().length, 0

  trix.test "element triggers attachment events", ->
    file = trix.createFile()
    element = getEditorElement()
    composition = getComposition()
    attachment = null
    events = []

    element.addEventListener "trix-file-accept", (event) ->
      events.push(event.type)
      trix.assert.ok file is event.file

    element.addEventListener "trix-attachment-add", (event) ->
      events.push(event.type)
      attachment = event.attachment

    composition.insertFile(file)
    trix.assert.deepEqual events, ["trix-file-accept", "trix-attachment-add"]

    element.addEventListener "trix-attachment-remove", (event) ->
      events.push(event.type)
      trix.assert.ok attachment is event.attachment

    attachment.remove()
    trix.assert.deepEqual events, ["trix-file-accept", "trix-attachment-add", "trix-attachment-remove"]

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
    trix.assert.deepEqual events, ["trix-attachment-edit", "trix-change"]

  trix.test "element triggers trix-change events when the document changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-change", (event) -> eventCount++

    trix.typeCharacters "a", ->
      trix.assert.equal eventCount, 1
      trix.moveCursor "left", ->
        trix.assert.equal eventCount, 1
        trix.typeCharacters "bcd", ->
          trix.assert.equal eventCount, 4
          trix.clickToolbarButton action: "undo", ->
            trix.assert.equal eventCount, 5
            done()

  trix.test "element triggers trix-selection-change events when the location range changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-selection-change", (event) -> eventCount++

    trix.typeCharacters "a", ->
      trix.assert.equal eventCount, 1
      trix.moveCursor "left", ->
        trix.assert.equal eventCount, 2
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
      trix.assert.equal eventCountA, 1
      trix.assert.equal eventCountB, 0

      elementB.editor.setSelectedRange(0)
      trix.assert.equal eventCountA, 1
      trix.assert.equal eventCountB, 1

      elementA.editor.setSelectedRange(1)
      trix.assert.equal eventCountA, 2
      trix.assert.equal eventCountB, 1
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
          trix.assert.deepEqual events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]
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
        trix.assert.equal eventCount, 1
        trix.assert.ok Trix.rangesAreEqual([5, 5], range)
        done()

  trix.test "element triggers attribute change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    attributes = null

    element.addEventListener "trix-attributes-change", (event) ->
      eventCount++
      {attributes} = event

    trix.typeCharacters "", ->
      trix.assert.equal eventCount, 0
      trix.clickToolbarButton attribute: "bold", ->
        trix.assert.equal eventCount, 1
        trix.assert.deepEqual { bold: true }, attributes
        done()

  trix.test "element triggers action change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    actions = null

    element.addEventListener "trix-actions-change", (event) ->
      eventCount++
      {actions} = event

    trix.typeCharacters "", ->
      trix.assert.equal eventCount, 0
      trix.clickToolbarButton attribute: "bullet", ->
        trix.assert.equal eventCount, 1
        trix.assert.equal actions.decreaseBlockLevel, true
        trix.assert.equal actions.increaseBlockLevel, false
        done()

  trix.test "element triggers custom focus and blur events", (done) ->
    element = getEditorElement()

    focusEventCount = 0
    blurEventCount = 0
    element.addEventListener "trix-focus", -> focusEventCount++
    element.addEventListener "trix-blur", -> blurEventCount++

    trix.triggerEvent(element, "blur")
    trix.defer ->
      trix.assert.equal blurEventCount, 1
      trix.assert.equal focusEventCount, 0

      trix.triggerEvent(element, "focus")
      trix.defer ->
        trix.assert.equal blurEventCount, 1
        trix.assert.equal focusEventCount, 1

        trix.insertImageAttachment()
        trix.after 20, ->
          trix.clickElement element.querySelector("figure"), ->
            trix.clickElement element.querySelector("figcaption"), ->
              trix.defer ->
                trix.assert.equal document.activeElement, element.querySelector("textarea")
                trix.assert.equal blurEventCount, 1
                trix.assert.equal focusEventCount, 1
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
