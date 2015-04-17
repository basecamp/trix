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

    for view, index in @getChildViews()
      if index > 0 and node = view.createGroupJoiningNode?()
        element.appendChild(node)

      for node in view.getNodes()
        element.appendChild(node)

    [element]

  createContainerElement: (depth = @objectGroup.getDepth()) ->
    @getChildViews()[0].createContainerElement(depth)
