#= require trix/views/text_view

{makeElement, getBlockConfig} = Trix
{css} = Trix.config

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
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
      options = {
        tagName: Trix.config.blockAttributes.default.tagName,
        className: @block.className
      }
      element = makeElement(options)
      element.appendChild(node) for node in nodes
      [element]

  createContainerElement: (depth) ->
    attribute = @attributes[depth]
    {tagName} = getBlockConfig(attribute)
    options = {
      tagName: tagName,
      className: @block.className
    }

    if attribute is "attachmentGallery"
      size = @block.getBlockBreakPosition()
      options.className = "#{css.attachmentGallery} #{css.attachmentGallery}--#{size}"

    makeElement(options)

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  shouldAddExtraNewlineElement:->
    /\n\n$/.test(@block.toString())
