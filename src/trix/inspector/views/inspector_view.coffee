#= require trix/inspector/view

{makeElement} = Trix

class Trix.Inspector.InspectorView extends Trix.Inspector.View
  name: "inspector"
  events:
    "trix-selectionchange": ->
      @reposition()

  constructor: ({@editorElement, @element, @views}) ->
    super

  render: ->
    super

    for view in @views
      element = @element.querySelector("[data-name='#{view.name}']")
      view.setElement(element)
      view.render()

    @reposition()

  reposition: ->
    position = @composition.getPosition() ? 0
    selectionRect = try @editorElement.getClientRectAtPosition(position)
    elementRect = @editorElement.getBoundingClientRect()

    top = selectionRect?.top ? elementRect.top
    left = elementRect.left + elementRect.width

    @element.style.top = "#{top}px"
    @element.style.left = "#{left}px"
