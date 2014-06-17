#= require trix/controllers/attachment_controller
#= require trix/controllers/image_attachment_controller
#= require trix/views/document_view

class Trix.DocumentController
  constructor: (@element, @document, @config) ->
    @documentView = new Trix.DocumentView @element, @document

    @selectionLockCount = 0

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

  # Selection observer delegate

  selectionDidChange: (range) ->
    @expireCachedSelectedRange()

  # Composition selection delegate

  getSelectedRangeOfComposition: (composition) ->
    @getCachedSelectedRangeFromTextView()

  getRangeOfCompositionAtPoint: (composition, point) ->
    position = @getPositionAtPoint(point)
    [position, position] if position?

  getPointAtEndOfCompositionSelection: (composition) ->
    @documentView.getPointAtEndOfSelection()

  compositionDidRequestSelectionOfRange: (composition, range) ->
    @focus()
    @documentView.setSelectedRange(range)
    @expireCachedSelectedRange()

  # Selection

  lockSelection: ->
    if @selectionLockCount++ is 0
      @documentView.lockSelection()
      @expireCachedSelectedRange()
      @delegate?.textControllerDidLockSelection?()

  unlockSelection: ->
    if --@selectionLockCount is 0
      selectedRange = @documentView.unlockSelection()
      @documentView.setSelectedRange(selectedRange)
      @delegate?.textControllerDidUnlockSelection?()

  expandSelectedRangeAroundCommonAttribute: (attributeName) ->
    [left, right] = @documentView.getSelectedRange()
    originalLeft = left
    length = @text.getLength()

    left-- while left > 0 and @text.getCommonAttributesAtRange([left - 1, right])[attributeName]
    right++ while right < length and @text.getCommonAttributesAtRange([originalLeft, right + 1])[attributeName]

    @documentView.setSelectedRange([left, right])
    @expireCachedSelectedRange()

  getCachedSelectedRangeFromTextView: ->
    @cachedSelectedRange ?= @documentView.getSelectedRange()

  expireCachedSelectedRange: ->
    delete @cachedSelectedRange

  getPositionAtPoint: (point) ->
    @documentView.getPositionAtPoint(point)
