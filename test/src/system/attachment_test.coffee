editorModule "Attachments", template: "editor_with_image"

editorTest "moving an image by drag and drop", (expectDocument) ->
  moveCursor direction: "right", times: 1, (coordinates) ->
    img = document.activeElement.querySelector("img")
    triggerEvent(img, "click")
    after 1, ->
      dragToCoordinates coordinates, ->
        expectDocument "a#{Trix.OBJECT_REPLACEMENT_CHARACTER}b\n"

editorTest "resizing an image", (expectDocument) ->
  figure = document.activeElement.querySelector("figure.attachment.image")
  clickElement figure, ->
    ok handle = figure.querySelector(".resize-handle")

    mouseDownOnElementAndMove handle, 5, ->
      locationRangeOfAttachment = Trix.LocationRange.forLocationWithLength({index: 0, offset: 2}, 1)
      attributes = editor.document.getCommonAttributesAtLocationRange(locationRangeOfAttachment)
      equal attributes.width, 15
      ok attributes.height in [15,16], "expected image height: 15 or 16, actual: #{attributes.height}"
      expectDocument "ab#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n"

editorTest "removing an image", (expectDocument) ->
  figure = document.activeElement.querySelector("figure.attachment.image")
  triggerEvent(figure, "click")
  closeButton = figure.querySelector(".remove")
  clickElement closeButton, ->
    expectDocument "ab\n"
