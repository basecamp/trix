#= require trix/text
#= require trix/input
#= require trix/text_view
#= require trix/selection_observer
#= require trix/attachment_controller

class Trix.TextController
  constructor: (@element) ->
    @text = new Trix.Text
    @text.delegate = this
    @input = new Trix.Input @element, this
    @textView = new Trix.TextView @element, @text
    @selectionObserver = new Trix.SelectionObserver
    @selectionObserver.delegate = this
    @attachmentController = new Trix.AttachmentController @element
    @attachmentController.delegate = this

    @currentAttributes = {}
    @element.addEventListener("focus", @didFocus)

  focus: ->
    @textView.focus()

  didFocus: =>
    if lockedRange = @unlockSelection()
      @setPosition(lockedRange[1])
    @delegate?.textControllerDidFocus?()

  # Text delegate

  didEditText: (text) ->
    @render()

  # Attachment controller delegate

  attachmentControllerDidChangeAttributesAtPosition: (attributes, position) ->
    @text.addAttributesAtRange(attributes, [position, position + 1])

  # Input responder

  insertText: (text, updatePosition = true) ->
    if selectedRange = @getSelectedRange()
      position = selectedRange[0]
      @text.replaceTextAtRange(text, selectedRange)
    else
      position = @getPosition()
      @text.insertTextAtPosition(text, position)

    @setPosition(position + (if updatePosition then text.getLength() else 0))

  insertString: (string, updatePosition = true) ->
    text = Trix.Text.textForStringWithAttributes(string, @currentAttributes)
    @insertText(text, updatePosition)

  insertAttachment: (attachment, updatePosition = true) ->
    text = Trix.Text.textForAttachmentWithAttributes(attachment, @currentAttributes)
    @insertText(text, updatePosition)

  deleteFromCurrentPosition: (distance = -1) ->
    unless range = @getSelectedRange()
      position = @getPosition()
      offset = position + distance
      range = if distance < 0 then [offset, position] else [position, offset]

    @text.removeTextAtRange(range)
    @setPosition(range[0])

  deleteBackward: ->
    @deleteFromCurrentPosition(-1)

  deleteForward: ->
    @deleteFromCurrentPosition(1)

  deleteWordBackward: ->
    if @getSelectedRange()
      @deleteBackward()
    else
      position = @getPosition()
      stringBeforePosition = @text.getStringAtRange([0, position])
      positionBeforeLastWord = stringBeforePosition.search(/(\b\w+)\W*$/)
      @deleteFromCurrentPosition(positionBeforeLastWord - position)

  positionAtPoint: (point) ->
    position = @textView.getPositionAtPoint(point)
    @setPosition(position)

  moveTextFromRange: (range) ->
    position = @getPosition()
    @text.moveTextFromRangeToPosition(range, position)
    @setPosition(position)

  getTextFromSelection: ->
    if selectedRange = @getSelectedRange()
      @text.getTextAtRange(selectedRange)

  beginComposing: ->
    @textView.lockSelection()
    @composing = true

  isComposing: ->
    @composing

  endComposing: (composedString) ->
    @render()
    @textView.unlockSelection()
    @insertString(composedString)
    delete @composing

  render: ->
    @textView.render()
    @delegate?.textControllerDidRender?()

  # Current attributes

  toggleCurrentAttribute: (attributeName) ->
    value = not @currentAttributes[attributeName]
    @setCurrentAttribute(attributeName, value)

  setCurrentAttribute: (attributeName, value) ->
    if selectedRange = @getSelectedRange()
      if value
        attributes = {}
        attributes[attributeName] = value
        @text.addAttributesAtRange(attributes, selectedRange)
      else
        @text.removeAttributeAtRange(attributeName, selectedRange)
    else
      if value
        @currentAttributes[attributeName] = value
      else
        delete @currentAttributes[attributeName]

    @notifyDelegateOfCurrentAttributesChange()

  updateCurrentAttributes: ->
    if selectedRange = @getSelectedRange()
      @currentAttributes = @text.getCommonAttributesAtRange(selectedRange)
      @notifyDelegateOfCurrentAttributesChange()
    else if (position = @getPosition())?
      # TODO: Consider whitelisting allowed current attributes from previous position
      @currentAttributes = @text.getAttributesAtPosition(position - 1)
      @adjustCurrentAttributesForPosition(position)
      @notifyDelegateOfCurrentAttributesChange()

  adjustCurrentAttributesForPosition: (position) ->
    # Don't consider these attributes current when the cursor is positioned after them
    for attribute in ["href", "width", "height"]
      if currentAttribute = @currentAttributes[attribute]
        if currentAttribute isnt @text.getAttributesAtPosition(position)[attribute]
          delete @currentAttributes[attribute]

  notifyDelegateOfCurrentAttributesChange: ->
    @delegate?.textControllerDidChangeCurrentAttributes?(@currentAttributes)

  # Selection observer delegate

  selectionDidChange: (range) ->
    @expireCachedSelectedRange()
    @updateCurrentAttributes()
    @delegate?.textControllerDidChangeSelection?()

  # Selection

  getCachedSelectedRangeFromTextView: ->
    @cachedSelectedRange ?= @textView.getSelectedRange()

  expireCachedSelectedRange: ->
    delete @cachedSelectedRange

  getSelectedRange: ->
    if selectedRange = @getCachedSelectedRangeFromTextView()
      selectedRange unless rangeIsCollapsed(selectedRange)

  getPosition: ->
    if selectedRange = @getCachedSelectedRangeFromTextView()
      selectedRange[0] if rangeIsCollapsed(selectedRange)

  setPosition: (position) ->
    @focus()
    @textView.setSelectedRange([position, position])
    @expireCachedSelectedRange()

  getPositionAtPoint: (point) ->
    @textView.findPositionAtPoint(point)

  expandSelectedRangeAroundCommonAttribute: (attributeName) ->
    [left, right] = @textView.getSelectedRange()
    originalLeft = left
    length = @text.getLength()

    left-- while left > 0 and @text.getCommonAttributesAtRange([left - 1, right])[attributeName]
    right++ while right < length and @text.getCommonAttributesAtRange([originalLeft, right + 1])[attributeName]

    @textView.setSelectedRange([left, right])
    @expireCachedSelectedRange()

  lockSelection: ->
    @lockingSelection = true
    if @currentAttributes["href"]
      @expandSelectedRangeAroundCommonAttribute("href")

    if selectedRange = @getSelectedRange()
      @text.addAttributeAtRange("selected", true, selectedRange)

    @textView.lockSelection()
    delete @lockingSelection

  unlockSelection: ->
    return if @lockingSelection
    if selectedRange = @getSelectedRange()
      @text.removeAttributeAtRange("selected", selectedRange)

    @expireCachedSelectedRange()
    @textView.unlockSelection()

  rangeIsCollapsed = ([startPosition, endPosition]) ->
    startPosition is endPosition
