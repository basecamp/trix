#= require trix/observers/mutation_observer

{handleEvent, innerElementIsActive} = Trix

class Trix.AbstractInputController extends Trix.BasicObject
  constructor: (@element) ->
    @mutationObserver = new Trix.MutationObserver @element
    @mutationObserver.delegate = this
    for eventName of @events
      handleEvent eventName, onElement: @element, withCallback: @handlerFor(eventName)

  events: {}

  elementDidMutate: (mutationSummary) ->
    @handleInput ->
      if @mutationIsSignificant(mutationSummary)
        if @mutationIsExpected(mutationSummary)
          @requestRender()
        else
          @requestReparse()

  mutationIsSignificant: (mutationSummary) ->
    true

  mutationIsExpected: (mutationSummary) ->
    false

  editorWillSyncDocumentView: ->
    @mutationObserver.stop()

  editorDidSyncDocumentView: ->
    @mutationObserver.start()

  requestRender: ->
    @delegate?.inputControllerDidRequestRender?()

  requestReparse: ->
    @delegate?.inputControllerDidRequestReparse?()
    @requestRender()

  # Private

  handlerFor: (eventName) ->
    (event) =>
      unless event.defaultPrevented
        @handleInput ->
          unless innerElementIsActive(@element)
            @eventName = eventName
            @events[eventName].call(this, event)

  handleInput: (callback) ->
    try
      @delegate?.inputControllerWillHandleInput()
      callback.call(this)
    finally
      @delegate?.inputControllerDidHandleInput()
