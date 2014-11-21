#= require ./selection_view
#= require ./inspector_panel_view
#= require ./structure_panel_view
#= require ./undo_panel_view
#= require ./render_count_view
#= require ./source_panel_view
#= require ./debugging_panel_view
#= require ./loggers_panel_view

{defer} = Trix.Helpers
{handleEvent, findClosestElementFromNode} = Trix.DOM

class Trix.InspectorController
  constructor: (@element, @editorController) ->
    @toolbarElement = @element.querySelector(".trix-inspector-toolbar")
    handleEvent "change", onElement: @toolbarElement, withCallback: @didClickToolbarButton
    handleEvent "click", onElement: @toolbarElement, withCallback: @didClickToolbar

    selectionElement = @element.querySelector(".trix-inspector-selection-view")
    @selectionView = new Trix.SelectionView selectionElement, @editorController

    renderCountElement = @element.querySelector(".trix-inspector-render-count-view")
    @renderCountView = new Trix.RenderCountView renderCountElement

    @activePanelView = null
    @render()

  didClickToolbarButton: (event) =>
    @activatePanel(event.target.value)

  didClickToolbar: (event) =>
    unless findClosestElementFromNode(event.target, matchingSelector: "input[name=inspector-panel]")
      @deactivateActivePanel()

  activatePanel: (name) ->
    inputElement = @findInputElement(name)
    inputElement.checked = "checked"

    @activePanelView?.destroy()
    @activePanelView = @createViewForPanel(name)
    @activePanelView.show()

  deactivateActivePanel: ->
    return unless @activePanelView
    @activePanelView.destroy()
    delete @activePanelView

    for input in @element.querySelectorAll("input[name=inspector-panel]")
      input.checked = false

  createViewForPanel: (name) ->
    element = @findPanelElement(name)
    className = element.getAttribute("data-inspector-panel-view") ? "InspectorPanelView"
    new Trix[className] element, @editorController

  findInputElement: (name) ->
    @element.querySelector("input[value=#{name}]")

  findPanelElement: (name) ->
    @element.querySelector("[data-inspector-panel-name=#{name}]")

  incrementRenderCount: -> defer =>
    @renderCountView.incrementAndRender()

  render: -> defer =>
    @selectionView.render()
    @renderCountView.render()
    @activePanelView?.render()
