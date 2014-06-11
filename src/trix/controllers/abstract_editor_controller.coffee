#= require trix/models/text
#= require trix/models/document
#= require trix/utilities/dom
#= require trix/utilities/html_parser

class Trix.AbstractEditorController
  constructor: (@config) ->
    {@textElement, @toolbarElement, @textareaElement, @inputElement, @delegate} = @config

    texts = for i in [1..3]
      text = @createText()
      text.attributes = text.attributes.add("quote", true) if i is 2
      text

    @document = new Trix.Document texts
    @initialize()

  initialize: ->

  createText: ->
    if @textElement.textContent.trim()
      Trix.Text.fromHTML(@textElement.innerHTML)
    else if @inputElement?.value
      Trix.Text.fromJSON(@inputElement.value)
    else
      new Trix.Text

  saveSerializedText: ->
    @textareaElement.value = @textElement.innerHTML
    Trix.DOM.trigger(@textareaElement, "input")
    @inputElement?.value = @text.asJSON()
