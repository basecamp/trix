editorModule "Attachments", template: "editor_with_image", ->
  editorTest "moving an image by drag and drop", (expectDocument) ->
    trix.typeCharacters "!", ->
      trix.moveCursor direction: "right", times: 1, (coordinates) ->
        img = document.activeElement.querySelector("img")
        trix.triggerEvent(img, "mousedown")
        trix.defer ->
          trix.dragToCoordinates coordinates, ->
            expectDocument "!a#{Trix.OBJECT_REPLACEMENT_CHARACTER}b\n"

  editorTest "removing an image", (expectDocument) ->
    trix.after 20, ->
      trix.clickElement getFigure(), ->
        closeButton = getFigure().querySelector(".#{Trix.config.css.classNames.attachment.removeButton}")
        trix.clickElement closeButton, ->
          expectDocument "ab\n"

  editorTest "editing an image caption", (expectDocument) ->
    trix.after 20, ->
      trix.clickElement findElement("figure"), ->
        trix.clickElement findElement("figcaption"), ->
          trix.defer ->
            ok findElement("textarea")
            findElement("textarea").focus()
            findElement("textarea").value = "my caption"
            trix.pressKey "return", ->
              ok not findElement("textarea")
              expectAttributes [2, 3], caption: "my caption"
              expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

getFigure = ->
  findElement("figure")

findElement = (selector) ->
  getEditorElement().querySelector(selector)
