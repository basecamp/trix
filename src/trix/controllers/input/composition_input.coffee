{browser} = Trix

class Trix.CompositionInput extends Trix.BasicObject
  constructor: (@inputController) ->
    {@responder, @delegate, @inputSummary} = @inputController
    @data = {}

  start: (data) ->
    @data.start = data

    if @isSignificant()
      if @inputSummary.eventName is "keypress" and @inputSummary.textAdded
        @responder?.deleteInDirection("left")

      unless @selectionIsExpanded()
        @insertPlaceholder()
        @requestRender()

      @range = @responder?.getSelectedRange()

  update: (data) ->
    @data.update = data

    if @isSignificant()
      if range = @selectPlaceholder()
        @forgetPlaceholder()
        @range = range

  end: (data) ->
    @data.end = data

    if @isSignificant()
      @forgetPlaceholder()

      if @canApplyToDocument()
        @setInputSummary(preferDocument: true, didInput: false)
        @delegate?.inputControllerWillPerformTyping()
        @responder?.setSelectedRange(@range)
        @responder?.insertString(@data.end)
        @responder?.setSelectedRange(@range[0] + @data.end.length)

      else if @data.start? or @data.update?
        @requestReparse()
        @inputController.reset()
    else
      @inputController.reset()

  getEndData: ->
    @data.end

  isEnded: ->
    @getEndData()?

  isSignificant: ->
    if browser.composesExistingText
      @inputSummary.didInput
    else
      true

  # Private

  canApplyToDocument: ->
    @data.start?.length is 0 and @data.end?.length > 0 and @range?

  @proxyMethod "inputController.setInputSummary"
  @proxyMethod "inputController.requestRender"
  @proxyMethod "inputController.requestReparse"
  @proxyMethod "responder?.selectionIsExpanded"
  @proxyMethod "responder?.insertPlaceholder"
  @proxyMethod "responder?.selectPlaceholder"
  @proxyMethod "responder?.forgetPlaceholder"
