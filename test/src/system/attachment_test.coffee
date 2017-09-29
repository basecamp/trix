{after, assert, clickElement, defer, dragToCoordinates, moveCursor, pressKey, test, testGroup, triggerEvent, typeCharacters} = Trix.TestHelpers

testGroup "Attachments", template: "editor_with_image", ->
  test "moving an image by drag and drop", (expectDocument) ->
    typeCharacters "!", ->
      moveCursor direction: "right", times: 1, (coordinates) ->
        img = document.activeElement.querySelector("img")
        triggerEvent(img, "mousedown")
        defer ->
          dragToCoordinates coordinates, ->
            expectDocument "!a#{Trix.OBJECT_REPLACEMENT_CHARACTER}b\n"

  test "removing an image", (expectDocument) ->
    after 20, ->
      clickElement getFigure(), ->
        closeButton = getFigure().querySelector(".#{Trix.config.css.attachmentRemove}")
        clickElement closeButton, ->
          expectDocument "ab\n"

  test "editing an image caption", (expectDocument) ->
    after 20, ->
      clickElement findElement("figure"), ->
        clickElement findElement("figcaption"), ->
          defer ->
            textarea = findElement("textarea")
            assert.ok textarea
            textarea.focus()
            textarea.value = "my caption"
            triggerEvent(textarea, "input")
            pressKey "return", ->
              assert.notOk findElement("textarea")
              assert.textAttributes [2, 3], caption: "my caption"
              assert.locationRange index: 0, offset: 3
              expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

  test "editing an attachment caption with no filename", (done) ->
    after 20, ->
      captionElement = findElement("figcaption")
      assert.ok captionElement.clientHeight > 0
      assert.equal captionElement.getAttribute("data-trix-placeholder"), Trix.config.lang.captionPlaceholder

      clickElement findElement("figure"), ->
        captionElement = findElement("figcaption")
        assert.ok captionElement.clientHeight > 0
        assert.equal captionElement.getAttribute("data-trix-placeholder"), Trix.config.lang.captionPlaceholder
        done()

  test "updating an attachment's href attribute while editing its caption", (expectDocument) ->
    attachment = getEditorController().attachmentManager.getAttachments()[0]
    after 20, ->
      clickElement findElement("figure"), ->
        clickElement findElement("figcaption"), ->
          defer ->
            textarea = findElement("textarea")
            assert.ok textarea
            textarea.focus()
            textarea.value = "my caption"
            triggerEvent(textarea, "input")
            attachment.setAttributes(href: "https://example.com")
            defer ->
              textarea = findElement("textarea")
              assert.ok document.activeElement is textarea
              assert.equal textarea.value, "my caption"
              pressKey "return", ->
                assert.notOk findElement("textarea")
                assert.textAttributes [2, 3], caption: "my caption"
                assert.locationRange index: 0, offset: 3
                expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

getFigure = ->
  findElement("figure")

findElement = (selector) ->
  getEditorElement().querySelector(selector)
