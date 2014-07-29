#= require trix/models/text
#= require trix/models/document
#= require trix/utilities/dom
#= require trix/utilities/html_parser

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@documentElement, @toolbarElement, @textareaElement, @inputElement} = @config
    @document = @createDocument()
    @document.initializeAttachmentManagerWithDelegate(@config.delegate)

  createDocument: ->
    if @documentElement.textContent.trim()
      Trix.Document.fromHTML(@documentElement.innerHTML)
    else if @inputElement?.value
      Trix.Document.fromJSONString(@inputElement.value)
    else
      new Trix.Document

  saveSerializedText: ->
    @textareaElement.value = @documentElement.innerHTML
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @document.toJSONString()
