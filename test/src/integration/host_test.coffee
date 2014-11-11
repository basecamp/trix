editorModule "Host", template: "editor_empty"

editorTest "files are rejected without a delegate", (expectDocument) ->
  editor.delegate = null
  editor.composition.insertFile(createFile())
  expectDocument("\n")

editorTest "rejecting files", (expectDocument) ->
  editor.delegate = shouldAcceptFile: -> false
  editor.composition.insertFile(createFile())
  expectDocument("\n")

editorTest "accepting files", (expectDocument) ->
  editor.delegate =
    shouldAcceptFile: (file) ->
      equal file.name, "hello.txt"
      true

  editor.composition.insertFile(createFile(name: "hello.txt"))
  expectDocument("#{Trix.AttachmentPiece.OBJECT_REPLACEMENT_CHARACTER}\n")

editorTest "removing an attachment", (expectDocument) ->
  editor.delegate = createHostDelegate()

  editor.composition.insertString("abc")
  editor.composition.insertFile(createFile())
  equal editor.delegate.attachments.length, 1

  editor.composition.insertString("def")
  editor.delegate.attachments[0].remove()
  equal editor.delegate.attachments.length, 0

  expectDocument "abcdef\n"

editorTest "setting an attachment's URL", (done) ->
  editor.delegate = createHostDelegate()
  editor.composition.insertFile(createFile(name: "hello.txt"))

  url = "http://example.com/hello.txt"
  managedAttachment = editor.delegate.attachments[0]
  managedAttachment.setAttributes({url})

  attachment = editor.document.getAttachments()[0]
  equal attachment.getURL(), url
  ok document.activeElement.querySelector("figure[data-trix-url='#{url}']")
  done()

editorTest "setting an attachment's upload progress", (done) ->
  editor.delegate = createHostDelegate()
  editor.composition.insertFile(createFile(name: "hello.txt"))
  managedAttachment = editor.delegate.attachments[0]

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
