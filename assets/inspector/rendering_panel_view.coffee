#= require ./inspector_panel_view

{handleEvent} = Trix.DOM

class Trix.RenderingPanelView extends Trix.InspectorPanelView
  constructor: ->
    super

    {@documentController} = @editorController
    @input = @element.querySelector("input")

    handleEvent "click", onElement: @element, matchingSelector: "label", withCallback: @didClickCachingCheckbox
    handleEvent "click", onElement: @element, matchingSelector: "button", withCallback: @didClickRenderButton

  didClickCachingCheckbox: =>
    if @input.checked
      @documentController.enableViewCaching()
    else
      @documentController.disableViewCaching()

  didClickRenderButton: =>
    @documentController.render()

  render: =>
    super
    @input.checked = @documentController.isViewCachingEnabled()
