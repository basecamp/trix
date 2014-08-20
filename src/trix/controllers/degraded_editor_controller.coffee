#= require trix/controllers/abstract_editor_controller
#= require trix/views/document_view

class Trix.DegradedEditorController extends Trix.AbstractEditorController
  constructor: ->
    super
    @render()
    @documentElement.addEventListener("blur", @didBlur)

  didBlur: =>
    @updateDocument()

  updateDocument: ->
    @document = Trix.Document.fromHTML(@documentElement.innerHTML)
    @render()
    @saveSerializedText()

  render: ->
    view = new Trix.DocumentView @documentElement, @document
    view.render()
