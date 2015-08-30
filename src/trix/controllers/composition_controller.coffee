#= require trix/controllers/attachment_editor_controller
#= require trix/views/document_view

{handleEvent, tagName, benchmark, findClosestElementFromNode}  = Trix

{attachmentSelector} = Trix.AttachmentView

class Trix.CompositionController extends Trix.BasicObject
  constructor: (@element, @composition) ->
    @documentView = new Trix.DocumentView @composition.document, {@element}

    handleEvent "focus", onElement: @element, withCallback: @didFocus
    handleEvent "click", onElement: @element, matchingSelector: "a[contenteditable=false]", preventDefault: true
    handleEvent "mousedown", onElement: @element, matchingSelector: attachmentSelector, withCallback: @didClickAttachment
    handleEvent "click", onElement: @element, matchingSelector: "a#{attachmentSelector}", preventDefault: true

  didFocus: =>
    @delegate?.documentControllerDidFocus?()

  didClickAttachment: (event, target) =>
    attachment = @findAttachmentForElement(target)
    @delegate?.documentControllerDidSelectAttachment?(attachment)

  render: benchmark "DocumentController#render", ->
    @documentView.setDocument(@composition.document)

    unless @documentView.isSynced()
      @delegate?.documentControllerWillSyncDocumentView?()
      @documentView.sync()
      @reinstallAttachmentEditor()
      @delegate?.documentControllerDidSyncDocumentView?()

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

  refreshViewCache: ->
    @documentView.garbageCollectCachedViews()

  # Attachment editor management

  installAttachmentEditorForAttachment: (attachment) ->
    return if @attachmentEditor?.attachment is attachment
    return unless element = @documentView.findElementForObject(attachment)
    @uninstallAttachmentEditor()
    attachmentPiece = @document.getAttachmentPieceForAttachment(attachment)
    @attachmentEditor = new Trix.AttachmentEditorController attachmentPiece, element, @element
    @attachmentEditor.delegate = this

  uninstallAttachmentEditor: ->
    @attachmentEditor?.uninstall()

  reinstallAttachmentEditor: ->
    if @attachmentEditor
      attachment = @attachmentEditor.attachment
      @uninstallAttachmentEditor()
      @installAttachmentEditorForAttachment(attachment)

  editAttachmentCaption: ->
    @attachmentEditor?.editCaption()

  # Attachment controller delegate

  didUninstallAttachmentEditor: ->
    delete @attachmentEditor
    @render()

  attachmentEditorDidRequestUpdatingAttributesForAttachment: (attributes, attachment) ->
    @delegate?.documentControllerWillUpdateAttachment?(attachment)
    @document.updateAttributesForAttachment(attributes, attachment)

  attachmentEditorDidRequestRemovingAttributeForAttachment: (attribute, attachment) ->
    @delegate?.documentControllerWillUpdateAttachment?(attachment)
    @document.removeAttributeForAttachment(attribute, attachment)

  attachmentEditorDidRequestRemovalOfAttachment: (attachment) ->
    @delegate?.documentControllerDidRequestRemovalOfAttachment?(attachment)

  attachmentEditorDidRequestDeselectingAttachment: (attachment) ->
    @delegate?.documentControllerDidRequestDeselectingAttachment?(attachment)

  # Private

  findAttachmentForElement: (element) ->
    @document.getAttachmentById(Number(element.dataset.trixId))
