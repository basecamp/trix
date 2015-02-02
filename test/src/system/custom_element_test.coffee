editorModule "Custom element API", template: "editor_empty"

editorTest "files are accepted by default", ->
  getComposition().insertFile(createFile())
  equal getEditor().getAttachments().length, 1

editorTest "rejecting a file by canceling the beforeattach event", ->
  getEditorElement().addEventListener "beforeattach", (event) -> event.preventDefault()
  getComposition().insertFile(createFile())
  equal getEditor().getAttachments().length, 0

editorTest "element triggers attachment events", ->
  file = createFile()
  element = getEditorElement()
  composition = getComposition()
  attachment = null
  events = []

  element.addEventListener "beforeattach", (event) ->
    events.push("beforeattach")
    ok file is event.file

  element.addEventListener "attach", (event) ->
    events.push("attach")
    attachment = event.attachment

  composition.insertFile(file)
  deepEqual events, ["beforeattach", "attach"]

  element.addEventListener "unattach", (event) ->
    events.push("unattach")
    ok attachment is event.attachment

  attachment.remove()
  deepEqual events, ["beforeattach", "attach", "unattach"]

editorTest "element triggers input events when the document changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "input", (event) -> eventCount++

  typeCharacters "a", ->
    ok eventCount is 1
    moveCursor "left", ->
      ok eventCount is 1
      typeCharacters "bcd", ->
        ok eventCount is 4
        clickToolbarButton action: "undo", ->
          ok eventCount is 5
          done()

editorTest "element triggers selectionchange events when the location range changes", (done) ->
  element = getEditorElement()
  eventCount = 0
  element.addEventListener "selectionchange", (event) -> eventCount++

  typeCharacters "a", ->
    ok eventCount is 1
    moveCursor "left", ->
      ok eventCount is 2
      done()
