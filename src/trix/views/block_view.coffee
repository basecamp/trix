#= require trix/views/text_view

{makeElement} = Trix.DOM

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    @attributes = @block.getAttributes()
    attribute = @attributes[@attributes.length - 1]
    @config = Trix.blockAttributes[attribute] ? Trix.blockAttributes.default
    @textConfig = @config.text ? {}

  createNodes: ->
    if @block.isEmpty()
      nodes = [makeElement("br")]
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      nodes = textView.getNodes()
      nodes.push(makeElement("br")) if @shouldAddExtraNewlineElement()

    if @attributes.length
      nodes
    else
      element = makeElement(@config.tagName)
      element.appendChild(node) for node in nodes
      [element]

  createContainerElement: (depth) ->
    attribute = @attributes[depth]
    config = Trix.blockAttributes[attribute]
    if config?.tagName
      makeElement(config.tagName)
    else
      document.createDocumentFragment()

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    if string = @block.toString()
      # A newline followed by the block break newline
      /\n\n$/.test(string)
