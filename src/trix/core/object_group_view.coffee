#= require ./object_view

{findInnerElement, makeElement} = Trix.DOM

class Trix.ObjectGroupView extends Trix.ObjectView
  constructor: ->
    super
    @objectGroup = @object
    @objects = @objectGroup.getObjects()
    {@viewClass} = @options
    delete @options.viewClass

  createNodes: ->
    views = for object in @objects
      @findOrCreateCachedChildView(@viewClass, object, @options)

    element = views[0].createGroupElement(@objectGroup.depth)
    innerElement = findInnerElement(element)

    for view in views
      parent = if view instanceof @constructor
        findInnerElement(previousViewElement ? innerElement)
      else
        innerElement

      viewElement = view.getInnerElement()
      parent.appendChild(viewElement)
      previousViewElement = viewElement
    [element]

  createGroupElement: ->
    attribute = @objects[0].getAttributes()[0]
    tagName = Trix.blockAttributes[attribute].tagName
    makeElement(tagName)
