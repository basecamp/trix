editorModule "Host API", template: "editor_empty"

editorTest "files are rejected without a delegate", (expectDocument) ->
  getEditorController().delegate = null
  getComposition().insertFile(createFile())
  expectDocument("\n")

editorTest "rejecting files", (expectDocument) ->
  getEditorController().delegate = shouldAcceptFile: -> false
  getComposition().insertFile(createFile())
  expectDocument("\n")

editorTest "accepting files", (expectDocument) ->
  getEditorController().delegate =
    shouldAcceptFile: (file) ->
      equal file.name, "hello.txt"
      true

  getComposition().insertFile(createFile(name: "hello.txt"))
  expectDocument("#{Trix.OBJECT_REPLACEMENT_CHARACTER}\n")

editorTest "removing an attachment", (expectDocument) ->
  getEditorController().delegate = createHostDelegate()

  getComposition().insertString("abc")
  getComposition().insertFile(createFile())
  equal getEditorController().delegate.attachments.length, 1

  getComposition().insertString("def")
  getEditorController().delegate.attachments[0].remove()
  equal getEditorController().delegate.attachments.length, 0

  expectDocument "abcdef\n"

editorTest "setting an attachment's URL", (done) ->
  getEditorController().delegate = createHostDelegate()
  getComposition().insertFile(createFile(name: "hello.txt"))

  url = "http://example.com/hello.txt"
  managedAttachment = getEditorController().delegate.attachments[0]
  managedAttachment.setAttributes({url})

  attachment = getDocument().getAttachments()[0]
  equal attachment.getURL(), url
  element = document.activeElement.querySelector("figure[data-trix-id='#{managedAttachment.id}']")
  equal JSON.parse(element.dataset.trixAttachment).url, url
  done()

editorTest "setting an attachment's upload progress", (done) ->
  getEditorController().delegate = createHostDelegate()
  getComposition().insertFile(createFile(name: "hello.txt"))
  managedAttachment = getEditorController().delegate.attachments[0]

  managedAttachment.setUploadProgress(40)
  equal document.activeElement.querySelector("progress").value, 40

  managedAttachment.setUploadProgress(77)
  equal document.activeElement.querySelector("progress").value, 77

  managedAttachment.setAttributes(url: "http://example")
  ok not document.activeElement.querySelector("progress")
  done()

createHostDelegate = ->
  delegate =
    attachments: []
    shouldAcceptFile: ->
      true
    didAddAttachment: (attachment) ->
      delegate.attachments.push(attachment)
    didRemoveAttachment: (removedAttachment) ->
      delegate.attachments = (attachment for attachment in delegate.attachments when attachment isnt removedAttachment)
