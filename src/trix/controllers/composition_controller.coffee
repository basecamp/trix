#= require trix/controllers/attachment_editor_controller
#= require trix/views/document_view

{handleEvent, tagName, findClosestElementFromNode, innerElementIsActive, defer}  = Trix

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
    @delegate?.compositionControllerDidSelectAttachment?(attachment)

  render: ->
    unless @revision is @composition.revision
      @documentView.setDocument(@composition.document)
      @documentView.render()
      @revision = @composition.revision

    unless @documentView.isSynced()
      @delegate?.compositionControllerWillSyncDocumentView?()
      @documentView.sync()
      @reinstallAttachmentEditor()
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

  installAttachmentEditorForAttachment: (attachment) ->
    return if @attachmentEditor?.attachment is attachment
    return unless element = @documentView.findElementForObject(attachment)
    @uninstallAttachmentEditor()
    attachmentPiece = @composition.document.getAttachmentPieceForAttachment(attachment)
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

  findAttachmentForElement: (element) ->
    @composition.document.getAttachmentById(parseInt(element.dataset.trixId, 10))
