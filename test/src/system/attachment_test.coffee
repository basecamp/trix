editorModule "Attachments", template: "editor_with_image"

editorTest "moving an image by drag and drop", (expectDocument) ->
  typeCharacters "!", ->
    moveCursor direction: "right", times: 1, (coordinates) ->
      img = document.activeElement.querySelector("img")
      triggerEvent(img, "mousedown")
      after 1, ->
        dragToCoordinates coordinates, ->
          expectDocument "!a#{Trix.OBJECT_REPLACEMENT_CHARACTER}b\n"

editorTest "removing an image", (expectDocument) ->
  after 20, ->
    clickElement getFigure(), ->
      closeButton = getFigure().querySelector(".attachment__remover")
      clickElement closeButton, ->
        expectDocument "ab\n"

editorTest "editing an image caption", (expectDocument) ->
  clickElement findElement("figure"), ->
    clickElement findElement("figcaption"), ->
      ok findElement("textarea")
      findElement("textarea").focus()
      findElement("textarea").value = "my caption"
      pressKey "return", ->
        ok not findElement("textarea")
        expectAttributes [2, 3], caption: "my caption"
        expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

getFigure = ->
  findElement("figure")

findElement = (selector) ->
  getDocumentElement().querySelector(selector)
