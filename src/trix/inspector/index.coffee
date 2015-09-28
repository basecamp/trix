#= require_self
#= require_tree ./templates
#= require_tree ./views
#= require ./element

class Trix.Inspector
  @views: []

  @registerView: (constructor) ->
    @views.push(constructor)

  constructor: (@editorElement) ->
    @element = document.createElement("trix-inspector")
    @views = @createViews()

    for view in @views
      view.render()
      @element.appendChild(view.element)

    @reposition()
    document.body.appendChild(@element)

  createViews: ->
    views = for View in @constructor.views
      new View @editorElement

    views.sort (a, b) ->
      a.title.toLowerCase() > b.title.toLowerCase()

  reposition: ->
    position = @editorElement.composition.getPosition() ? 0
    selectionRect = try @editorElement.getClientRectAtPosition(position)
    elementRect = @editorElement.getBoundingClientRect()

    top = selectionRect?.top ? elementRect.top
    left = elementRect.left + elementRect.width

    @element.style.top = "#{top}px"
    @element.style.left = "#{left}px"
