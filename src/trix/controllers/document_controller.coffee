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
    if event.target.trixAttachmentId
      @installAttachmentEditorForElement(event.target)
    else
      @uninstallAttachmentEditor()

  render: ->
    @delegate?.documentControllerWillRender?()
    @documentView.render()
    @delegate?.documentControllerDidRender?()

  focus: ->
    @documentView.focus()

  # Attachment editor management

  installAttachmentEditorForElement: (element) ->
    attachment = @document.attachments.get(element.trixAttachmentId)
    return if @attachmentEditor?.attachment is attachment
    @uninstallAttachmentEditor()

    if attachment.isImage()
      @attachmentEditor = new Trix.ImageEditorController attachment, element, @element
      @attachmentEditor.delegate = this

  uninstallAttachmentEditor: ->
    @attachmentEditor?.uninstall()

  # Attachment controller delegate

  didUninstallAttachmentEditor: ->
    delete @attachmentEditor

  attachmentEditorWillEditAttachment: (attachment) ->
    @delegate?.documentControllerWillEditAttachment?(attachment)
