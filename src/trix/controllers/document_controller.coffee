#= require trix/controllers/image_editor_controller
#= require trix/views/document_view

class Trix.DocumentController
  constructor: (@element, @document) ->
    @documentView = new Trix.DocumentView @element, @document

    @element.addEventListener("focus", @didFocus)
    @element.addEventListener("click", @didClick)

    @render()

  didFocus: =>
    @delegate?.documentControllerDidFocus?()

  didClick: (event) =>
    if id = event.target.trixAttachmentId
      attachment = @document.getAttachmentById(id)
      @delegate?.documentControllerDidSelectAttachment?(attachment)

  render: ->
    @delegate?.documentControllerWillRender?()
    @documentView.render()
    @delegate?.documentControllerDidRender?()

  focus: ->
    @documentView.focus()

  # Attachment editor management

  installAttachmentEditorForAttachment: (attachment) ->
    return if @attachmentEditor?.attachment is attachment
    return unless element = @findElementForAttachment(attachment)
    @uninstallAttachmentEditor()

    if attachment.isImage()
      @attachmentEditor = new Trix.ImageEditorController attachment, element, @element
      @attachmentEditor.delegate = this

  uninstallAttachmentEditor: ->
    @attachmentEditor?.uninstall()

  # Attachment controller delegate

  didUninstallAttachmentEditor: ->
    delete @attachmentEditor

  attachmentEditorWillUpdateAttachment: (attachment) ->
    @delegate?.documentControllerWillUpdateAttachment?(attachment)

  # Private

  findElementForAttachment: (attachment) ->
    for figure in @element.querySelectorAll("figure")
      return figure if figure.trixAttachmentId is attachment.id
