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
    if not @blockContainsSingleCharacter()
      element = @createContainerElement()

      for view in @getChildViews()
        element.appendChild(node) for node in view.getNodes()

      [element]
    else
      singleCharacterView = @getChildViews()[0]
      singleCharacterView.getNodes()

  createContainerElement: (depth = @objectGroup.getDepth()) ->
    @getChildViews()[0].createContainerElement(depth)

  blockContainsSingleCharacter: ->
    @getChildViews()[0].block.isSingleCharacter()