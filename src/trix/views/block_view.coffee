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

    if @config.groupTagName
      element = makeElement(@config.tagName)
      element.appendChild(node) for node in nodes
      [element]
    else
      nodes

  createContainerElement: (depth = 0) ->
    attribute = @block.getAttributes()[depth]
    config = Trix.blockAttributes[attribute]
    makeElement(config.groupTagName ? config.tagName)

  getElement: ->
    element = makeElement(@config.tagName)
    element.appendChild(node) for node in @getNodes()
    element

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    if string = @block.toString()
      # A newline followed by the block break newline
      /\n\n$/.test(string)
