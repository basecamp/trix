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
    element = @createContainerElement()
    innerElement = findInnerElement(element)

    for view in @getChildViews()
      parent = if view instanceof @constructor
        findInnerElement(innerElement)
      else
        innerElement

      parent.appendChild(node) for node in view.getNodes(@objectGroup.getDepths())
    [element]

  createContainerElement: ->
    @getChildViews()[0].createContainerElement(@objectGroup.getDepths())
