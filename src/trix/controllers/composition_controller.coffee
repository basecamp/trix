#= require trix/controllers/attachment_editor_controller
#= require trix/views/document_view

{findClosestElementFromNode, handleEvent, innerElementIsActive, defer}  = Trix

{attachmentSelector} = Trix.AttachmentView

class Trix.CompositionController extends Trix.BasicObject
  constructor: (@element, @composition) ->
    @documentView = new Trix.DocumentView @composition.document, {@element}

    handleEvent "focus", onElement: @element, withCallback: @didFocus
    handleEvent "blur", onElement: @element, withCallback: @didBlur
    handleEvent "click", onElement: @element, matchingSelector: "a[contenteditable=false]", preventDefault: true
    handleEvent "mousedown", onElement: @element, matchingSelector: attachmentSelector, withCallback: @didClickAttachment
    handleEvent "click", onElement: @element, matchingSelector: "a#{attachmentSelector}", preventDefault: true

  didFocus: (event) =>
    perform = =>
      unless @focused
        @focused = true
        @delegate?.compositionControllerDidFocus?()

    @blurPromise?.then(perform) ? perform()

  didBlur: (event) =>
    @blurPromise = new Promise (resolve) =>
      defer =>
        unless innerElementIsActive(@element)
          @focused = null
          @delegate?.compositionControllerDidBlur?()
        @blurPromise = null
        resolve()

  didClickAttachment: (event, target) =>
    attachment = @findAttachmentForElement(target)
    editCaption = findClosestElementFromNode(event.target, matchingSelector: "figcaption")?
    @delegate?.compositionControllerDidSelectAttachment?(attachment, {editCaption})

  getSerializableElement: ->
    if @isEditingAttachment()
      @documentView.shadowElement
    else
      @element

  render: ->
    unless @revision is @composition.revision
      @documentView.setDocument(@composition.document)
      @documentView.render()
      @revision = @composition.revision

    if @canSyncDocumentView() and not @documentView.isSynced()
      @delegate?.compositionControllerWillSyncDocumentView?()
      @documentView.sync()
      @delegate?.compositionControllerDidSyncDocumentView?()

    @delegate?.compositionControllerDidRender?()

  rerenderViewForObject: (object) ->
    @invalidateViewForObject(object)
    @render()

  invalidateViewForObject: (object) ->
    @documentView.invalidateViewForObject(object)

  isViewCachingEnabled: ->
    @documentView.isViewCachingEnabled()

  enableViewCaching: ->
    @documentView.enableViewCaching()

  disableViewCaching: ->
    @documentView.disableViewCaching()

  refreshViewCache: ->
    @documentView.garbageCollectCachedViews()

  # Attachment editor management

  isEditingAttachment: ->
    @attachmentEditor?

  installAttachmentEditorForAttachment: (attachment, options) ->
    return if @attachmentEditor?.attachment is attachment
    return unless element = @documentView.findElementForObject(attachment)
    @uninstallAttachmentEditor()
    attachmentPiece = @composition.document.getAttachmentPieceForAttachment(attachment)
    @attachmentEditor = new Trix.AttachmentEditorController attachmentPiece, element, @element, options
    @attachmentEditor.delegate = this

  uninstallAttachmentEditor: ->
    @attachmentEditor?.uninstall()

  # Attachment controller delegate

  didUninstallAttachmentEditor: ->
    @attachmentEditor = null
    @render()

  attachmentEditorDidRequestUpdatingAttributesForAttachment: (attributes, attachment) ->
    @delegate?.compositionControllerWillUpdateAttachment?(attachment)
    @composition.updateAttributesForAttachment(attributes, attachment)

  attachmentEditorDidRequestRemovingAttributeForAttachment: (attribute, attachment) ->
    @delegate?.compositionControllerWillUpdateAttachment?(attachment)
    @composition.removeAttributeForAttachment(attribute, attachment)

  attachmentEditorDidRequestRemovalOfAttachment: (attachment) ->
    @delegate?.compositionControllerDidRequestRemovalOfAttachment?(attachment)

  attachmentEditorDidRequestDeselectingAttachment: (attachment) ->
    @delegate?.compositionControllerDidRequestDeselectingAttachment?(attachment)

  # Private

  canSyncDocumentView: ->
    not @isEditingAttachment()

  findAttachmentForElement: (element) ->
    @composition.document.getAttachmentById(parseInt(element.dataset.trixId, 10))
