#= require trix/views/text_view

{makeElement} = Trix.DOM

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    @config = @block.getConfig()
    @textConfig = @config.text ? {}

  createNodes: ->
    if @block.isEmpty()
      nodes = [makeElement("br")]
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      nodes = textView.getNodes()
      nodes.push(makeElement("br")) if @shouldAddExtraNewlineElement()
    nodes

  getElement: ->
    element = makeElement(@config.tagName)
    element.appendChild(node) for node in @getNodes()
    element

  getInnerElement: ->
    if @config.groupTagName
      @getElement()
    else
      element = document.createDocumentFragment()
      element.appendChild(node) for node in @getNodes()
      element

  createGroupElement: (depth = 0) ->
    tagNames = for attribute in @block.getAttributes()[depth..] when config = Trix.blockAttributes[attribute]
      config.groupTagName ? config.tagName

    for tagName in tagNames
      if innerElement
        pendingElement = makeElement(tagName)
        innerElement.appendChild(pendingElement)
        innerElement = pendingElement
      else
        element = innerElement = makeElement(tagName)
    element


  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    if string = @block.toString()
      # A newline followed by the block break newline
      /\n\n$/.test(string)
