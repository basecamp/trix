#= require trix/controllers/controller

{triggerEvent, defer} = Trix

class Trix.EditorElementController extends Trix.Controller
  constructor: (@element, @documentElement, @inputElement) ->
    @contentType = @element.getAttribute("content-type")

  save: ->
    value = Trix.serializeToContentType(@documentElement, @contentType)
    @inputElement.value = value
    @element.setAttribute("value", value)

  # Editor controller delegate

  didSetEditor: (editor) ->
    @document = editor.document
    @save()

  didChangeDocument: (document) ->
    defer(@saveAndNotify)

  didPasteAtPositionRange: (positionRange) ->
    triggerEvent("trix-paste", onElement: @element, attributes: {positionRange})

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

  didRenderDocumentElement: ->
    triggerEvent("trix-render", onElement: @element)

  didChangeSelection: ->
    triggerEvent("selectionchange", onElement: @element, bubbles: false)

  # Private

  saveAndNotify: =>
    @save()
    triggerEvent("input", onElement: @element)
