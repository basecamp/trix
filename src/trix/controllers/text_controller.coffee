#= require trix/controllers/attachment_controller
#= require trix/views/text_view

class Trix.TextController
  constructor: (@element, @text, @config) ->
    @textView = new Trix.TextView @element, @text

    @selectionLockCount = 0

    @element.addEventListener("focus", @didFocus)
    @element.addEventListener("click", @didClick)

    @render()
    @focus() if @config.autofocus

  focus: ->
    @textView.focus()

  didFocus: =>
    @delegate?.textControllerDidFocus?()

  didClick: (event) =>
    if id = event.target.trixAttachmentId
      new Trix.AttachmentController event.target, @element

  render: ->
    @textView.render()
    @delegate?.textControllerDidRender?()

  # Selection observer delegate

  selectionDidChange: (range) ->
    @expireCachedSelectedRange()

  # Composition selection delegate

  getSelectedRangeOfComposition: (composition) ->
    @getCachedSelectedRangeFromTextView()

  getRangeOfCompositionAtPoint: (composition, point) ->
    position = @getPositionAtPoint(point)
    [position, position] if position?

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
