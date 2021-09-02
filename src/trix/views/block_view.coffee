#= require trix/views/text_view

{makeElement, getBlockConfig} = Trix
{css} = Trix.config

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super(arguments...)
    @block = @object
    @attributes = @block.getAttributes()

  createNodes: ->
    comment = document.createComment("block")
    nodes = [comment]
    if @block.isEmpty()
      nodes.push(makeElement("br"))
    else
      textConfig = getBlockConfig(@block.getLastAttribute())?.text
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {textConfig})
      nodes.push(textView.getNodes()...)
      nodes.push(makeElement("br")) if @shouldAddExtraNewlineElement()

    if @attributes.length
      nodes
    else
      {tagName} = Trix.config.blockAttributes.default
      attributes = dir: "rtl" if @block.isRTL()

      element = makeElement({tagName, attributes})
      element.appendChild(node) for node in nodes
      [element]

  createContainerElement: (depth) ->
    attributeName = @attributes[depth]

    {tagName} = getBlockConfig(attributeName)
    attributes = dir: "rtl" if depth is 0 and @block.isRTL()

    if attributeName is "attachmentGallery"
      size = @block.getBlockBreakPosition()
      className = "#{css.attachmentGallery} #{css.attachmentGallery}--#{size}"

    makeElement({tagName, className, attributes})

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    /\n\n$/.test(@block.toString())
