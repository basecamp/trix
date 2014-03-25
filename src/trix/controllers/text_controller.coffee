#= require trix/controllers/attachment_controller
#= require trix/views/text_view

class Trix.TextController
  constructor: (@element, @text) ->
    @text.delegate = this

    @textView = new Trix.TextView @element, @text

    @attachmentController = new Trix.AttachmentController @element
    @attachmentController.delegate = this

    @selectionLockCount = 0

    @element.addEventListener("focus", @didFocus)

  focus: ->
    @textView.focus()

  didFocus: =>
    @delegate?.textControllerDidFocus?()

  render: ->
    @textView.render()
    @delegate?.textControllerDidRender?()

  # Text delegate

  didEditText: (text) ->
    @render()

  # Attachment controller delegate

  attachmentControllerDidChangeAttributesAtPosition: (attributes, position) ->
    @text.addAttributesAtRange(attributes, [position, position + 1])

  # Selection observer delegate

  selectionDidChange: (range) ->
    @expireCachedSelectedRange()

  # Composition selection delegate

  getSelectedRangeForComposition: (composition) ->
    @getCachedSelectedRangeFromTextView()

  compositionDidRequestSelectionOfRange: (composition, range) ->
    @focus()
    @textView.setSelectedRange(range)
    @expireCachedSelectedRange()

  # Selection

  lockSelection: ->
    if @selectionLockCount++ is 0
      @textView.lockSelection()
      @delegate?.textControllerDidLockSelection?()

  unlockSelection: ->
    if --@selectionLockCount is 0
      selectedRange = @textView.unlockSelection()
      @textView.setSelectedRange(selectedRange)
      @delegate?.textControllerDidUnlockSelection?()

  getCachedSelectedRangeFromTextView: ->
    @cachedSelectedRange ?= @textView.getSelectedRange()

  expireCachedSelectedRange: ->
    delete @cachedSelectedRange

  getPositionAtPoint: (point) ->
    @textView.findPositionAtPoint(point)
