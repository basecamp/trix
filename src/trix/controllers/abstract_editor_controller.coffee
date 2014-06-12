#= require trix/models/text
#= require trix/models/document
#= require trix/utilities/dom
#= require trix/utilities/html_parser

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@textElement, @toolbarElement, @textareaElement, @inputElement, @delegate} = @config
    @document = @createDocument()
    @initialize()

  initialize: ->

  createDocument: ->
    if @textElement.textContent.trim()
      Trix.Document.fromHTML(@textElement.innerHTML)
    else if @inputElement?.value
      Trix.Document.fromJSONString(@inputElement.value)
    else
      new Trix.Document

  saveSerializedText: ->
    @textareaElement.value = @textElement.innerHTML
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @document.asJSON()
