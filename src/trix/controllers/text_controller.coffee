#= require trix/controllers/attachment_controller
#= require trix/controllers/image_attachment_controller
#= require trix/views/text_view

class Trix.TextController
  constructor: (@element, @text, @config) ->
    @textView = new Trix.TextView @element, @text

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
    @textView.render()
    @delegate?.textControllerDidRender?()

  focus: ->
    @textView.focus()

  # Attachment controller management

  installAttachmentController: (element) ->
    attachment = @text.getAttachmentById(element.trixAttachmentId)
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
    @text.resizeAttachmentToDimensions(attachment, dimensions)

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
    @textView.getPointAtEndOfSelection()

  compositionDidRequestSelectionOfRange: (composition, range) ->
    @focus()
    @textView.setSelectedRange(range)
    @expireCachedSelectedRange()

  # Selection

  lockSelection: ->
    if @selectionLockCount++ is 0
      @textView.lockSelection()
      @expireCachedSelectedRange()
      @delegate?.textControllerDidLockSelection?()

  unlockSelection: ->
    if --@selectionLockCount is 0
      selectedRange = @textView.unlockSelection()
      @textView.setSelectedRange(selectedRange)
      @delegate?.textControllerDidUnlockSelection?()

  expandSelectedRangeAroundCommonAttribute: (attributeName) ->
    [left, right] = @textView.getSelectedRange()
    originalLeft = left
    length = @text.getLength()

    left-- while left > 0 and @text.getCommonAttributesAtRange([left - 1, right])[attributeName]
    right++ while right < length and @text.getCommonAttributesAtRange([originalLeft, right + 1])[attributeName]

    @textView.setSelectedRange([left, right])
    @expireCachedSelectedRange()

  getCachedSelectedRangeFromTextView: ->
    @cachedSelectedRange ?= @textView.getSelectedRange()

  expireCachedSelectedRange: ->
    delete @cachedSelectedRange

  getPositionAtPoint: (point) ->
    @textView.getPositionAtPoint(point)
