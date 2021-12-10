import BasicObject from "trix/core/basic_object"
import MutationObserver from "trix/observers/mutation_observer"
import FileVerificationOperation from "trix/operations/file_verification_operation"

import { handleEvent, innerElementIsActive } from "trix/core/helpers"

export default class InputController extends BasicObject
  constructor: (element) ->
    super(arguments...)
    @element = element
    @mutationObserver = new MutationObserver @element
    @mutationObserver.delegate = this
    for eventName of @events
      handleEvent eventName, onElement: @element, withCallback: @handlerFor(eventName)

  events: {}

  elementDidMutate: (mutationSummary) ->

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
    operations = (new FileVerificationOperation(file) for file in files)
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

  createLinkHTML: (href, text) ->
    link = document.createElement("a")
    link.href = href
    link.textContent = text ? href
    link.outerHTML
