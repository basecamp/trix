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

  insertAttachment: (attachment) ->
    getComposition().insertAttachment(attachment)
    render()

  insertAttachments: (attachments) ->
    getComposition().insertAttachments(attachments)
    render()

  insertImageAttachment: (attributes) ->
    attachment = helpers.createImageAttachment(attributes)
    helpers.insertAttachment(attachment)

  createImageAttachment: (attributes) ->
    attributes ?=
      url: TEST_IMAGE_URL
      width: 10
      height: 10
      filename: "image.gif"
      filesize: 35
      contentType: "image/gif"

    new Trix.Attachment attributes

  replaceDocument: (document) ->
    getComposition().setDocument(document)
    render()

render = ->
  getEditorController().render()
