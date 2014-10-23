#= require trix/controllers/abstract_editor_controller
#= require trix/views/document_view

{handleEvent} = Trix.DOM

class Trix.DegradedEditorController extends Trix.AbstractEditorController
  constructor: ->
    super
    @render()
    handleEvent "blur", onElement: @documentElement, withCallback: @didBlur

  didBlur: =>
    @updateDocument()

  updateDocument: ->
    @document = Trix.Document.fromHTML(@documentElement.innerHTML)
    @render()
    @saveSerializedDocument()

  render: ->
    view = new Trix.DocumentView @documentElement, @document
    view.render()
