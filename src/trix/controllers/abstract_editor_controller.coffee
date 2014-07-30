#= require trix/models/text
#= require trix/models/document
#= require trix/utilities/dom
#= require trix/utilities/html_parser

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@documentElement, @toolbarElement, @textareaElement, @inputElement} = @config
    @document = @createDocument()
    @document.initializeAttachmentManagerCollectionWithDelegate(@config.delegate)

  createDocument: ->
    if @documentElement.textContent.trim()
      Trix.Document.fromHTML(@documentElement.innerHTML)
    else if @inputElement?.value
      Trix.Document.fromJSONString(@inputElement.value)
    else
      new Trix.Document

  saveSerializedText: ->
    @textareaElement.value = @serializedHTML()
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @document.toSerializableDocument().toJSONString()

  serializedHTML: ->
    element = @documentElement.cloneNode(true)
    for pendingElement in element.querySelectorAll("[data-trix-pending]")
      pendingElement.parentNode.removeChild(pendingElement)
    element.innerHTML
