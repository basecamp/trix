#= require trix/controllers/abstract_editor_controller
#= require trix/views/block_view

class Trix.DegradedEditorController extends Trix.AbstractEditorController
  constructor: ->
    super
    @render()
    @textElement.addEventListener("blur", @didBlur)

  didBlur: =>
    @updateDocument()

  updateDocument: ->
    @document = Trix.Document.fromHTML(@textElement.innerHTML)
    @render()
    @saveSerializedText()

  render: ->
    view = new Trix.DocumentView @textElement, @document
    view.render()
