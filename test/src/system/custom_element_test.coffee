editorModule "Custom element API", template: "editor_empty"

editorTest "files are accepted by default", ->
  getComposition().insertFile(createFile())
  equal getComposition().getAttachments().length, 1

editorTest "rejecting a file by canceling the trix-file-accept event", ->
  getEditorElement().addEventListener "trix-file-accept", (event) -> event.preventDefault()
  getComposition().insertFile(createFile())
  equal getComposition().getAttachments().length, 0

editorTest "element triggers attachment events", ->
  file = createFile()
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

editorTest "element triggers trix-change when an attachment is edited", ->
  file = createFile()
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

editorTest "element triggers trix-change events when the document changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "trix-change", (event) -> eventCount++

  typeCharacters "a", ->
    equal eventCount, 1
    moveCursor "left", ->
      equal eventCount, 1
      typeCharacters "bcd", ->
        equal eventCount, 4
        clickToolbarButton action: "undo", ->
          equal eventCount, 5
          done()

editorTest "element triggers trix-selection-change events when the location range changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "trix-selection-change", (event) -> eventCount++

  typeCharacters "a", ->
    equal eventCount, 1
    moveCursor "left", ->
      equal eventCount, 2
      done()

editorTest "element triggers toolbar dialog events", (done) ->
  element = getEditorElement()
  events = []

  element.addEventListener "trix-toolbar-dialog-show", (event) ->
    events.push(event.type)

  element.addEventListener "trix-toolbar-dialog-hide", (event) ->
    events.push(event.type)

  clickToolbarButton action: "link", ->
    typeInToolbarDialog "http://example.com", attribute: "href", ->
      defer ->
        deepEqual events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]
        done()

editorTest "element triggers paste event with position range", (done) ->
  element = getEditorElement()
  eventCount = 0
  range = null

  element.addEventListener "trix-paste", (event) ->
    eventCount++
    {range} = event

  typeCharacters "", ->
    pasteContent "text/html", "<strong>hello</strong>", ->
      equal eventCount, 1
      ok Trix.rangesAreEqual([5, 5], range)
      done()

editorTest "element triggers attribute change events", (done) ->
  element = getEditorElement()
  eventCount = 0
  attributes = null

  element.addEventListener "trix-attributes-change", (event) ->
    eventCount++
    {attributes} = event

  typeCharacters "", ->
    equal eventCount, 0
    clickToolbarButton attribute: "bold", ->
      equal eventCount, 1
      deepEqual { bold: true }, attributes
      done()

editorTest "element triggers action change events", (done) ->
  element = getEditorElement()
  eventCount = 0
  actions = null

  element.addEventListener "trix-actions-change", (event) ->
    eventCount++
    {actions} = event

  typeCharacters "", ->
    equal eventCount, 0
    clickToolbarButton attribute: "bullet", ->
      equal eventCount, 1
      equal actions.decreaseBlockLevel, true
      equal actions.increaseBlockLevel, false
      done()

editorTest "element triggers custom focus and blur events", (done) ->
  element = getEditorElement()

  focusEventCount = 0
  blurEventCount = 0
  element.addEventListener "trix-focus", -> focusEventCount++
  element.addEventListener "trix-blur", -> blurEventCount++

  triggerEvent(element, "blur")
  defer ->
    equal blurEventCount, 1
    equal focusEventCount, 0

    triggerEvent(element, "focus")
    defer ->
      equal blurEventCount, 1
      equal focusEventCount, 1

      insertImageAttachment()
      after 20, ->
        clickElement element.querySelector("figure"), ->
          clickElement element.querySelector("figcaption"), ->
            defer ->
              equal document.activeElement, element.querySelector("textarea")
              equal blurEventCount, 1
              equal focusEventCount, 1
              done()

editorTest "editor resets to its original value on form reset", (expectDocument) ->
  element = getEditorElement()
  form = element.inputElement.form

  typeCharacters "hello", ->
    form.reset()
    expectDocument("\n")

editorTest "editor resets to last-set value on form reset", (expectDocument) ->
  element = getEditorElement()
  form = element.inputElement.form

  element.value = "hi"
  typeCharacters "hello", ->
    form.reset()
    expectDocument("hi\n")

editorTest "editor respects preventDefault on form reset", (expectDocument) ->
  element = getEditorElement()
  form = element.inputElement.form
  preventDefault = (event) -> event.preventDefault()

  typeCharacters "hello", ->
    form.addEventListener("reset", preventDefault, false)
    form.reset()
    form.removeEventListener("reset", preventDefault, false)
    expectDocument("hello\n")
