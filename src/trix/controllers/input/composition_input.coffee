class Trix.CompositionInput extends Trix.BasicObject
  constructor: (@inputController) ->
    {@responder, @delegate, @inputSummary} = @inputController
    @data = {}

  start: (data) ->
    @data.start = data

    if @inputSummary.eventName is "keypress" and @inputSummary.textAdded
      @responder?.deleteInDirection("left")

    unless @selectionIsExpanded()
      @insertPlaceholder()
      @requestRender()

    @range = @responder?.getSelectedRange()

  update: (data) ->
    @data.update = data

    if range = @selectPlaceholder()
      @forgetPlaceholder()
      @range = range

  end: (data) ->
    @data.end = data
    @forgetPlaceholder()

    if @canApplyToDocument()
      @setInputSummary(preferDocument: true)
      @delegate?.inputControllerWillPerformTyping()
      @responder?.setSelectedRange(@range)
      @responder?.insertString(@data.end)
      @responder?.setSelectedRange(@range[0] + @data.end.length)

    else if @data.start? or @data.update?
      @requestReparse()
      @inputController.reset()

  getEndData: ->
    @data.end

  isEnded: ->
    @getEndData()?

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
