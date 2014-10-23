#= require ./selection_view
#= require ./inspector_panel_view
#= require ./text_panel_view
#= require ./undo_panel_view
#= require ./render_count_view

{defer} = Trix.Helpers

class Trix.InspectorController
  constructor: (@element, @editorController) ->
    @toolbarElement = @element.querySelector(".trix-inspector-toolbar")
    Trix.DOM.on(@toolbarElement, "change", @didClickToolbarButton)
    Trix.DOM.on(@toolbarElement, "click", @didClickToolbar)

    selectionElement = @element.querySelector(".trix-inspector-selection-view")
    @selectionView = new Trix.SelectionView selectionElement, @editorController

    renderCountElement = @element.querySelector(".trix-inspector-render-count-view")
    @renderCountView = new Trix.RenderCountView renderCountElement

    @activePanelView = null
    @render()

  didClickToolbarButton: (event) =>
    @activatePanel(event.target.value)

  didClickToolbar: (event) =>
    unless Trix.DOM.closest(event.target, "input[name=inspector-panel]")
      @deactivateActivePanel()

  activatePanel: (name) ->
    inputElement = @findInputElement(name)
    inputElement.checked = "checked"

    @activePanelView?.hide()
    @activePanelView = @createViewForPanel(name)
    @activePanelView.show()

    Trix.debug.logEditOperations = true

  deactivateActivePanel: ->
    return unless @activePanelView
    @activePanelView.hide()
    delete @activePanelView

    for input in @element.querySelectorAll("input[name=inspector-panel]")
      input.checked = false

    Trix.debug.logEditOperations = false

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
