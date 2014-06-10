#= require trix/controllers/abstract_editor_controller
#= require trix/views/text_view

class Trix.SimpleEditorController extends Trix.AbstractEditorController
  initialize: ->
    @render()
    @textElement.addEventListener("blur", @didBlur)

  didBlur: =>
    @updateText()

  updateText: ->
    @text = Trix.Text.fromHTML(@textElement.innerHTML)
    @render()
    @saveSerializedText()

  render: ->
    view = new Trix.TextView @textElement, @text
    view.render()
