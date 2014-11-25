#= require ./object_view

class Trix.ObjectGroupView extends Trix.ObjectView
  constructor: ->
    super
    @objectGroup = @object
    {@viewClass} = @options
    delete @options.viewClass

  createNodes: ->
    element = null
    for object in @objectGroup.getObjects()
      view = @findOrCreateCachedChildView(@viewClass, object, @options)
      element ?= view.createGroupElement()
      element.appendChild(view.getElement())
    [element]
