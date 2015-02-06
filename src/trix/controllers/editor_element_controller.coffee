#= require trix/controllers/controller

{triggerEvent, defer} = Trix

class Trix.EditorElementController extends Trix.Controller
  constructor: (@element, @documentElement, @inputElement) ->
    @contentType = @element.getAttribute("content-type") ? "text/html"

  save: ->
    value = Trix.serializeToContentType(@documentElement, @contentType)
    @inputElement.value = value
    @element.setAttribute("value", value)

  load: ->
    document = Trix.deserializeFromContentType(@inputElement.value, @contentType)
    @document.replaceDocument(document)

  # Editor controller delegate

  didSetEditor: (editor) ->
    @document = editor.document
    unless @loaded
      @load()
      @loaded = true

  didChangeDocument: (document) ->
    defer =>
      @save()
      triggerEvent("input", onElement: @element)

  shouldAcceptFile: (file) ->
    event = triggerEvent("trix-file-accept", onElement: @element, attributes: {file})
    not event.defaultPrevented

  didAddAttachment: (attachment) ->
    triggerEvent("trix-attachment-add", onElement: @element, attributes: {attachment})
    @save()

  didEditAttachment: (attachment) ->
    @save()

  didRemoveAttachment: (attachment) ->
    triggerEvent("trix-attachment-remove", onElement: @element, attributes: {attachment})
    @save()

  didRenderDocument: ->
    triggerEvent("trix-render", onElement: @element)

  didPaste: (paste) ->

  didThrowError: (error, details) ->

  didChangeSelection: ->
    triggerEvent("selectionchange", onElement: @element, bubbles: false)
