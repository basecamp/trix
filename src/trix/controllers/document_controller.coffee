#= require trix/controllers/attachment_editor_controller
#= require trix/controllers/image_attachment_editor_controller
#= require trix/views/document_view
#= require trix/utilities/dom

{DOM} = Trix

class Trix.DocumentController
  constructor: (@element, @document) ->
    @documentView = new Trix.DocumentView @element, @document

    DOM.on(@element, "focus", @didFocus)
    DOM.on(@element, "click", "a[contenteditable=false]", (e) -> e.preventDefault())
    DOM.on(@element, "click", "figure.attachment", @didClickAttachment)

    @render()

  didFocus: =>
    @delegate?.documentControllerDidFocus?()

  didClickAttachment: (event, target) =>
    attachment = @document.getAttachmentById(target.trixAttachmentId)
    @delegate?.documentControllerDidSelectAttachment?(attachment)

  render: ->
    @delegate?.documentControllerWillRender?()
    @documentView.render()
    @reinstallAttachmentEditor()
    @delegate?.documentControllerDidRender?()

  focus: ->
    @documentView.focus()

  # Attachment editor management

  installAttachmentEditorForAttachment: (attachment) ->
    return if @attachmentEditor?.attachment is attachment
    return unless element = @findElementForAttachment(attachment)
    @uninstallAttachmentEditor()

    controller = if attachment.isImage()
      Trix.ImageAttachmentEditorController
    else
      Trix.AttachmentEditorController

    @attachmentEditor = new controller attachment, element, @element
    @attachmentEditor.delegate = this

  uninstallAttachmentEditor: ->
    @attachmentEditor?.uninstall()

  reinstallAttachmentEditor: ->
    if @attachmentEditor
      attachment = @attachmentEditor.attachment
      @uninstallAttachmentEditor()
      @installAttachmentEditorForAttachment(attachment)

  # Attachment controller delegate

  didUninstallAttachmentEditor: ->
    delete @attachmentEditor

  attachmentEditorWillUpdateAttachment: (attachment) ->
    @delegate?.documentControllerWillUpdateAttachment?(attachment)

  # Private

  findElementForAttachment: (attachment) ->
    for figure in @element.querySelectorAll("figure")
      return figure if figure.trixAttachmentId is attachment.id
