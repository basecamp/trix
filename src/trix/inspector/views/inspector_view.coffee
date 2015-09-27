#= require trix/inspector/view

class Trix.Inspector.InspectorView extends Trix.Inspector.View
  constructor: ->
    super
    @installPanelViews()
    @reposition()

  events:
    "trix-selectionchange": ->
      @reposition()

  installPanelViews: ->
    for element in @element.querySelectorAll("[data-panel]")
      {panel} = element.dataset
      @["#{panel}View"] = new Trix.Inspector["#{capitalize(panel)}View"] @editorElement, element, panel

  reposition: ->
    position = @composition.getPosition() ? 0
    selectionRect = try @editorElement.getClientRectAtPosition(position)
    elementRect = @editorElement.getBoundingClientRect()

    top = selectionRect?.top ? elementRect.top
    left = elementRect.left + elementRect.width

    @element.style.top = "#{top}px"
    @element.style.left = "#{left}px"

capitalize = (string) ->
  string.charAt(0).toUpperCase() + string.substring(1)
