editorModule "Custom element API", template: "editor_empty"

editorTest "files are accepted by default", ->
  getComposition().insertFile(createFile())
  equal getEditor().getAttachments().length, 1

editorTest "rejecting a file by canceling the trix-file-accept event", ->
  getEditorElement().addEventListener "trix-file-accept", (event) -> event.preventDefault()
  getComposition().insertFile(createFile())
  equal getEditor().getAttachments().length, 0

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

editorTest "element triggers input events when the document changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "input", (event) -> eventCount++

  typeCharacters "a", ->
    equal eventCount, 1
    moveCursor "left", ->
      equal eventCount, 1
      typeCharacters "bcd", ->
        equal eventCount, 4
        clickToolbarButton action: "undo", ->
          equal eventCount, 5
          done()

editorTest "element triggers selectionchange events when the location range changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "selectionchange", (event) -> eventCount++

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
    getDocumentElement().focus()
    deepEqual events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]
    done()
