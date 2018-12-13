#= require trix/observers/mutation_observer
#= require trix/operations/file_verification_operation

{handleEvent, innerElementIsActive} = Trix

class Trix.InputController extends Trix.BasicObject
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

  attachFiles: (files) ->
    operations = (new Trix.FileVerificationOperation(file) for file in files)
    Promise.all(operations).then (files) =>
      @handleInput ->
        @delegate?.inputControllerWillAttachFiles()
        @responder?.insertFiles(files)
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
