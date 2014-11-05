editorModule "Attachments", template: "editor_with_image"

testEditorManipulation "moving an image by drag and drop", (expectDocument) ->
  moveCursor direction: "right", times: 1, (coordinates) ->
    document.activeElement.querySelector("img").dispatchEvent(createEvent("click"))
    after 1, ->
      dragToCoordinates coordinates, ->
        expectDocument "a#{Trix.AttachmentPiece.OBJECT_REPLACEMENT_CHARACTER}b\n"
