#= require trix/views/text_view

{makeElement} = Trix.DOM

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    @config = @block.getConfig()
    @textConfig = @config.text ? {}

  createNodes: ->
    tagNames = (Trix.blockAttributes[attribute] for attribute in @block.getAttributes())
    tagNames.push(@config.tagName) unless tagNames.length

    for tagName in tagNames
      if innerElement
        pendingElement = makeElement(tagName)
        innerElement.appendChild(pendingElement)
        innerElement = pendingElement
      else
        element = innerElement = makeElement(tagName)

    if @block.isEmpty()
      innerElement.appendChild(makeElement("br"))
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      innerElement.appendChild(node) for node in textView.getNodes()
      @appendExtraNewlineElement(innerElement)

    [element]

  createGroupElement: ->
    makeElement(@config.groupTagName)

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  appendExtraNewlineElement: (element) ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        element.appendChild(makeElement("br"))
