#= require trix/controllers/attachment_editor_controller
#= require trix/controllers/image_attachment_editor_controller
#= require trix/views/document_view

{handleEvent, tagName, benchmark} = Trix

class Trix.DocumentController extends Trix.BasicObject
  constructor: (@element, @document) ->
    @documentView = new Trix.DocumentView @document, {@element}

    handleEvent "focus", onElement: @element, withCallback: @didFocus
    handleEvent "click", onElement: @element, matchingSelector: "a[contenteditable=false]", preventDefault: true
    handleEvent "mousedown", onElement: @element, matchingSelector: "figure.attachment", withCallback: @didClickAttachment

  didFocus: =>
    @delegate?.documentControllerDidFocus?()

  didClickAttachment: (event, target) =>
    attachment = @findAttachmentForElement(target)
    @delegate?.documentControllerDidSelectAttachment?(attachment)

  render: benchmark "DocumentController#render", ->
    @documentView.render()

    unless @documentView.isSynced()
      console.log "documentView out of sync"
      @delegate?.documentControllerWillRender?()
      @documentView.sync()
      @addCursorTargetsAroundAttachments()
      @reinstallAttachmentEditor()
      @delegate?.documentControllerDidRender?()

  rerenderViewForObject: (object) ->
    @documentView.invalidateViewForObject(object)
    @render()

  focus: ->
    @documentView.focus()

  isViewCachingEnabled: ->
    @documentView.isViewCachingEnabled()

  enableViewCaching: ->
    @documentView.enableViewCaching()

  disableViewCaching: ->
    @documentView.disableViewCaching()

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

  attachmentEditorDidRequestUpdatingAttachmentWithAttributes: (attachment, attributes) ->
    @delegate?.documentControllerWillUpdateAttachment?(attachment)
    @document.updateAttributesForAttachment(attributes, attachment)

  attachmentEditorDidRequestRemovalOfAttachment: (attachment) ->
    @delegate?.documentControllerDidRequestRemovalOfAttachment?(attachment)

  # Private

  cursorTarget = """
    <span data-trix-serialize="false" data-trix-cursor-target="true">#{Trix.ZERO_WIDTH_SPACE}</span>
  """

  addCursorTargetsAroundAttachments: ->
    for element in @element.querySelectorAll("[data-trix-attachment]")
      element.insertAdjacentHTML("beforebegin", cursorTarget)
      element.insertAdjacentHTML("afterend", cursorTarget)

  findAttachmentForElement: (element) ->
    @document.getAttachmentById(Number(element.dataset.trixId))

  findElementForAttachment: (attachment) ->
    @documentView.findElementForObject(attachment)
