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
    nodes

  getNodes: (depths = [0]) ->
    nodes = super

    for attribute, index in @attributes.slice(depths[0])
      config = Trix.blockAttributes[attribute]
      tagName = if index is 0
        config.tagName
      else
        config.tagName ? config.groupTagName

      if tagName
        pendingElement = makeElement(tagName)

        if innerElement
          innerElement.appendChild(pendingElement)
          innerElement = pendingElement
        else
          element = innerElement = pendingElement

    if innerElement
      innerElement.appendChild(node) for node in nodes
      [element]
    else
      if @attributes.length is 0
        element = makeElement(@config.tagName)
        element.appendChild(node) for node in nodes
        [element]
      else
        nodes

  createContainerElement: (depths = [0]) ->
    for depth, index in depths
      attribute = @attributes[depth]
      config = Trix.blockAttributes[attribute]

      if index is 0 or config.tagName
        pendingElement = makeElement(config.groupTagName)

        if innerElement
          innerElement.appendChild(pendingElement)
          innerElement = pendingElement
        else
          element = innerElement = pendingElement
    element

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    if string = @block.toString()
      # A newline followed by the block break newline
      /\n\n$/.test(string)
