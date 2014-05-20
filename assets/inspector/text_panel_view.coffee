#= require ./inspector_panel_view

class Trix.TextPanelView extends Trix.InspectorPanelView
  constructor: ->
    super
    @text = @editorController.composition.text

  render: ->
    element = document.createElement("div")

    @text.eachRun (run) =>
      runElement = @renderRun(run)
      element.appendChild(runElement)

    @element.removeChild(@element.firstChild) while @element.firstChild
    @element.appendChild(element)

  renderRun: (run) ->
    element = document.createElement("div")
    element.className = "trix-run"

    content = for key, value of run
      "#{key}: #{JSON.stringify(value)}"

    element.textContent = content.join("\n")
    element
