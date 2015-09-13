#= require trix/controllers/controller

{triggerEvent, defer} = Trix

class Trix.EditorElementController extends Trix.Controller
  constructor: (@element, @documentElement, @inputElement) ->

  save: ->
    value = Trix.serializeToContentType(@documentElement, "text/html")
    @inputElement.value = value
    @element.setAttribute("value", value)

  # Editor controller delegate

  didSetEditor: (editor) ->
    @document = editor.document
    @save()

  didChangeDocument: (document) ->
    @documentChangedSinceLastRender = true

  didInitialize: ->
    requestAnimationFrame =>
      triggerEvent("trix-initialize", onElement: @element)

  didPasteDataAtRange: (pasteData, range) ->
    triggerEvent("trix-paste", onElement: @element, attributes: {pasteData, range})

  shouldAcceptFile: (file) ->
    triggerEvent("trix-file-accept", onElement: @element, attributes: {file})

  didAddAttachment: (attachment) ->
    triggerEvent("trix-attachment-add", onElement: @element, attributes: {attachment})
    @save()

  didEditAttachment: (attachment) ->
    @saveAndNotify()

  didRemoveAttachment: (attachment) ->
    triggerEvent("trix-attachment-remove", onElement: @element, attributes: {attachment})
    @save()

  didRenderDocument: ->
    if @documentChangedSinceLastRender
      delete @documentChangedSinceLastRender
      @saveAndNotify()

    triggerEvent("trix-render", onElement: @element)

  didSyncDocumentView: ->
    triggerEvent("trix-sync", onElement: @element)

  didChangeSelection: ->
    triggerEvent("trix-selectionchange", onElement: @element)

  didInvokeExternalAction: (actionName) ->
    triggerEvent("trix-action-invoke", onElement: @element, attributes: {actionName})

  didShowToolbarDialog: (dialogElement) ->
    triggerEvent("trix-toolbar-dialog-show", onElement: dialogElement)

  didHideToolbarDialog: (dialogElement) ->
    triggerEvent("trix-toolbar-dialog-hide", onElement: dialogElement)

  # Private

  saveAndNotify: =>
    @save()
    triggerEvent("trix-change", onElement: @element)
