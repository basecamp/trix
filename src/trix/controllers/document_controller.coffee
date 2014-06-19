#= require trix/controllers/attachment_controller
#= require trix/controllers/image_attachment_controller
#= require trix/views/document_view

class Trix.DocumentController
  constructor: (@element, @document, @config) ->
    @documentView = new Trix.DocumentView @element, @document

    @element.addEventListener("focus", @didFocus)
    @element.addEventListener("click", @didClick)

    @render()
    @focus() if @config.autofocus

  didFocus: =>
    @delegate?.textControllerDidFocus?()

  didClick: (event) =>
    if event.target.trixAttachmentId
      @installAttachmentController(event.target)
    else
      @uninstallAttachmentController()

  render: ->
    @delegate?.textControllerWillRender?()
    @documentView.render()
    @delegate?.textControllerDidRender?()

  focus: ->
    @documentView.focus()

  # Attachment controller management

  installAttachmentController: (element) ->
    attachment = @document.getAttachmentById(element.trixAttachmentId)
    unless @attachmentController?.attachment is attachment
      @uninstallAttachmentController()
      @attachmentController = Trix.AttachmentController.create(attachment, element, @element)
      @attachmentController.delegate = this

  uninstallAttachmentController: ->
    @attachmentController?.uninstall()

  # Attachment controller delegate

  didUninstallAttachmentController: ->
    delete @attachmentController

  attachmentControllerDidResizeAttachmentToDimensions: (attachment, dimensions) ->
    @delegate?.textControllerWillResizeAttachment?(attachment)
    @document.resizeAttachmentToDimensions(attachment, dimensions)
