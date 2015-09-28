#= require_self
#= require_tree ./templates
#= require_tree ./views
#= require ./element

class Trix.Inspector
  @views: []

  @registerView: (constructor) ->
    @views.push(constructor)

  constructor: (@editorElement) ->
    element = document.createElement("trix-inspector")
    views = @createViews()

    @view = new Trix.Inspector.InspectorView {@editorElement, element, views}
    @view.render()

    document.body.appendChild(@view.element)

  createViews: ->
    views = for View in @constructor.views
      new View {@editorElement}

    views.sort (a, b) ->
      if a.position is b.position
        if a.open is b.open
          a.name > b.name
        else
          b.open
      else
        a.position - b.position
