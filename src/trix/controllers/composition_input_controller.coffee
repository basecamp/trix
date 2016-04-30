class Trix.CompositionInputController extends Trix.BasicObject
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
      @delegate?.inputControllerWillPerformTyping()
      @responder?.setSelectedRange(@range)
      @responder?.insertString(@data.end)
      @setInputSummary(preferDocument: true)
      @setFinalSelection()

    else if @data.start? or @data.update?
      @requestReparse()
      @inputController.reset()

  # Private

  canApplyToDocument: ->
    @data.start?.length is 0 and @data.end?.length > 0 and @range?

  # Fix for compositions remaining selected in Firefox:
  # If the last composition update is the same as the final composition then
  # it's likely there won't be another mutation (and subsequent render + selection change).
  # In that case, collapse the selection and request a render.
  setFinalSelection: ->
    if @data.end? and @data.end is @data.update
      @unlessMutationOccurs =>
        if @selectionIsExpanded()
          @responder?.setSelection(@range[0] + @data.end.length)
          @requestRender()

  @proxyMethod "inputController.setInputSummary"
  @proxyMethod "inputController.requestRender"
  @proxyMethod "inputController.requestReparse"
  @proxyMethod "inputController.unlessMutationOccurs"
  @proxyMethod "responder?.selectionIsExpanded"
  @proxyMethod "responder?.insertPlaceholder"
  @proxyMethod "responder?.selectPlaceholder"
  @proxyMethod "responder?.forgetPlaceholder"
