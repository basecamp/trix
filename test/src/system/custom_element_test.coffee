{after, assert, clickElement, clickToolbarButton, createFile, defer, insertImageAttachment, moveCursor, pasteContent, skip, test, testGroup, triggerEvent, typeCharacters, typeInToolbarDialog} = Trix.TestHelpers

testGroup "Custom element API", template: "editor_empty", ->
  test "files are accepted by default", ->
    getComposition().insertFile(createFile())
    assert.equal getComposition().getAttachments().length, 1

  test "rejecting a file by canceling the trix-file-accept event", ->
    getEditorElement().addEventListener "trix-file-accept", (event) -> event.preventDefault()
    getComposition().insertFile(createFile())
    assert.equal getComposition().getAttachments().length, 0

  test "element triggers attachment events", ->
    file = createFile()
    element = getEditorElement()
    composition = getComposition()
    attachment = null
    events = []

    element.addEventListener "trix-file-accept", (event) ->
      events.push(event.type)
      assert.ok file is event.file

    element.addEventListener "trix-attachment-add", (event) ->
      events.push(event.type)
      attachment = event.attachment

    composition.insertFile(file)
    assert.deepEqual events, ["trix-file-accept", "trix-attachment-add"]

    element.addEventListener "trix-attachment-remove", (event) ->
      events.push(event.type)
      assert.ok attachment is event.attachment

    attachment.remove()
    assert.deepEqual events, ["trix-file-accept", "trix-attachment-add", "trix-attachment-remove"]

  test "element triggers trix-change when an attachment is edited", ->
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
    assert.deepEqual events, ["trix-attachment-edit", "trix-change"]

  test "element triggers trix-change events when the document changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-change", (event) -> eventCount++

    typeCharacters "a", ->
      assert.equal eventCount, 1
      moveCursor "left", ->
        assert.equal eventCount, 1
        typeCharacters "bcd", ->
          assert.equal eventCount, 4
          clickToolbarButton action: "undo", ->
            assert.equal eventCount, 5
            done()

  test "element triggers trix-change event after toggling attributes", (done) ->
    element = getEditorElement()
    editor = element.editor

    afterChangeEvent = (edit, callback) ->
      element.addEventListener "trix-change", handler = (event) ->
        element.removeEventListener("trix-change", handler)
        callback(event)
      edit()

    typeCharacters "hello", ->
      edit = -> editor.activateAttribute("quote")
      afterChangeEvent edit, ->
        assert.ok editor.attributeIsActive("quote")

        edit = -> editor.deactivateAttribute("quote")
        afterChangeEvent edit, ->
          assert.notOk editor.attributeIsActive("quote")

          editor.setSelectedRange([0, 5])
          edit = -> editor.activateAttribute("bold")
          afterChangeEvent edit, ->
            assert.ok editor.attributeIsActive("bold")

            edit = -> editor.deactivateAttribute("bold")
            afterChangeEvent edit, ->
              assert.notOk editor.attributeIsActive("bold")
              done()

  test "element triggers trix-selection-change events when the location range changes", (done) ->
    element = getEditorElement()
    eventCount = 0
    element.addEventListener "trix-selection-change", (event) -> eventCount++

    typeCharacters "a", ->
      assert.equal eventCount, 1
      moveCursor "left", ->
        assert.equal eventCount, 2
        done()

  test "only triggers trix-selection-change events on the active element", (done) ->
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
      assert.equal eventCountA, 1
      assert.equal eventCountB, 0

      elementB.editor.setSelectedRange(0)
      assert.equal eventCountA, 1
      assert.equal eventCountB, 1

      elementA.editor.setSelectedRange(1)
      assert.equal eventCountA, 2
      assert.equal eventCountB, 1
      done()

  test "element triggers toolbar dialog events", (done) ->
    element = getEditorElement()
    events = []

    element.addEventListener "trix-toolbar-dialog-show", (event) ->
      events.push(event.type)

    element.addEventListener "trix-toolbar-dialog-hide", (event) ->
      events.push(event.type)

    clickToolbarButton action: "link", ->
      typeInToolbarDialog "http://example.com", attribute: "href", ->
        defer ->
          assert.deepEqual events, ["trix-toolbar-dialog-show", "trix-toolbar-dialog-hide"]
          done()

  test "element triggers paste event with position range", (done) ->
    element = getEditorElement()
    eventCount = 0
    range = null

    element.addEventListener "trix-paste", (event) ->
      eventCount++
      {range} = event

    typeCharacters "", ->
      pasteContent "text/html", "<strong>hello</strong>", ->
        assert.equal eventCount, 1
        assert.ok Trix.rangesAreEqual([5, 5], range)
        done()

  test "element triggers attribute change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    attributes = null

    element.addEventListener "trix-attributes-change", (event) ->
      eventCount++
      {attributes} = event

    typeCharacters "", ->
      assert.equal eventCount, 0
      clickToolbarButton attribute: "bold", ->
        assert.equal eventCount, 1
        assert.deepEqual { bold: true }, attributes
        done()

  test "element triggers action change events", (done) ->
    element = getEditorElement()
    eventCount = 0
    actions = null

    element.addEventListener "trix-actions-change", (event) ->
      eventCount++
      {actions} = event

    typeCharacters "", ->
      assert.equal eventCount, 0
      clickToolbarButton attribute: "bullet", ->
        assert.equal eventCount, 1
        assert.equal actions.decreaseNestingLevel, true
        assert.equal actions.increaseNestingLevel, false
        done()

  test "element triggers custom focus and blur events", (done) ->
    element = getEditorElement()

    focusEventCount = 0
    blurEventCount = 0
    element.addEventListener "trix-focus", -> focusEventCount++
    element.addEventListener "trix-blur", -> blurEventCount++

    triggerEvent(element, "blur")
    defer ->
      assert.equal blurEventCount, 1
      assert.equal focusEventCount, 0

      triggerEvent(element, "focus")
      defer ->
        assert.equal blurEventCount, 1
        assert.equal focusEventCount, 1

        insertImageAttachment()
        after 20, ->
          clickElement element.querySelector("figure"), ->
            clickElement element.querySelector("figcaption"), ->
              defer ->
                assert.equal document.activeElement, element.querySelector("textarea")
                assert.equal blurEventCount, 1
                assert.equal focusEventCount, 1
                done()

  # Selenium doesn't seem to focus windows properly in some browsers (FF 47 on OS X)
  # so skip this test when unfocused pending a better solution.
  testOrSkip = if document.hasFocus() then test else skip
  testOrSkip "element triggers custom focus event when autofocusing", (done) ->
    element = document.createElement("trix-editor")
    element.setAttribute("autofocus", "")

    focusEventCount = 0
    element.addEventListener "trix-focus", -> focusEventCount++

    container = document.getElementById("trix-container")
    container.innerHTML = ""
    container.appendChild(element)

    element.addEventListener "trix-initialize", ->
      assert.equal focusEventCount, 1
      done()

  test "element serializes HTML after attribute changes", (done) ->
    element = getEditorElement()
    serializedHTML = element.value

    typeCharacters "a", ->
      assert.notEqual serializedHTML, element.value
      serializedHTML = element.value

      clickToolbarButton attribute: "quote", ->
        assert.notEqual serializedHTML, element.value
        serializedHTML = element.value

        clickToolbarButton attribute: "quote", ->
          assert.notEqual serializedHTML, element.value
          done()

  test "editor resets to its original value on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form

    typeCharacters "hello", ->
      form.reset()
      expectDocument("\n")

  test "editor resets to last-set value on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form

    element.value = "hi"
    typeCharacters "hello", ->
      form.reset()
      expectDocument("hi\n")

  test "editor respects preventDefault on form reset", (expectDocument) ->
    element = getEditorElement()
    form = element.inputElement.form
    preventDefault = (event) -> event.preventDefault()

    typeCharacters "hello", ->
      form.addEventListener("reset", preventDefault, false)
      form.reset()
      form.removeEventListener("reset", preventDefault, false)
      expectDocument("hello\n")
