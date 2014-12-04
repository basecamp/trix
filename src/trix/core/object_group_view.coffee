#= require ./object_view

{findInnerElement, makeElement} = Trix.DOM

class Trix.ObjectGroupView extends Trix.ObjectView
  constructor: ->
    super
    @objectGroup = @object
    {@viewClass} = @options
    delete @options.viewClass

  getChildViews: ->
    unless @childViews.length
      for object in @objectGroup.getObjects()
        @findOrCreateCachedChildView(@viewClass, object, @options)
    @childViews

  createNodes: ->
    container = @createContainerElement()

    for view in @getChildViews()
      element = if view instanceof @constructor
        findInnerElement(container)
      else
        container

      for node in view.getNodes()
        element.appendChild(node)
    [container]

  createContainerElement: (depth = @objectGroup.depth) ->
    @getChildViews()[0].createContainerElement(depth)
