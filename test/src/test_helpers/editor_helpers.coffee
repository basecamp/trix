helpers = Trix.TestHelpers

helpers.extend
  insertString: (string) ->
    getComposition().insertString(string)
    render()

  insertText: (text) ->
    getComposition().insertText(text)
    render()

  insertDocument: (document) ->
    getComposition().insertDocument(document)
    render()

  insertFile: (file) ->
    getComposition().insertFile(file)
    render()

  insertImageAttachment: (attributes) ->
    attributes ?=
      url: TEST_IMAGE_URL
      width: 10
      height: 10
      filename: "image.gif"
      contentType: "image/gif"

    attachment = new Trix.Attachment attributes
    text = Trix.Text.textForAttachmentWithAttributes(attachment)
    helpers.insertText(text)

  replaceDocument: (document) ->
    getComposition().setDocument(document)
    render()

render = ->
  getEditorController().render()
