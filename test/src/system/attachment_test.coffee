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
        closeButton = getFigure().querySelector(".#{Trix.config.css.classNames.attachment.removeButton}")
        clickElement closeButton, ->
          expectDocument "ab\n"

  test "editing an image caption", (expectDocument) ->
    after 20, ->
      clickElement findElement("figure"), ->
        clickElement findElement("figcaption"), ->
          defer ->
            assert.ok findElement("textarea")
            findElement("textarea").focus()
            findElement("textarea").value = "my caption"
            pressKey "return", ->
              assert.notOk findElement("textarea")
              assert.textAttributes [2, 3], caption: "my caption"
              expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

getFigure = ->
  findElement("figure")

findElement = (selector) ->
  getEditorElement().querySelector(selector)
