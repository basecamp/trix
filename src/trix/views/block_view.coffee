#= require trix/views/object_view
#= require trix/views/text_view

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    {@blockIndex} = @options
    @blockConfig = @getBlockConfig()
    @textConfig = @blockConfig.text ? {}

  createNodes: ->
    @element = document.createElement(@blockConfig.tagName ? "div")

    if @block.isEmpty()
      br = document.createElement("br")
      @element.appendChild(br)
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      @element.appendChild(node) for node in textView.getNodes()
      @appendExtraNewlineElement()

    [@element]

  getBlockConfig: ->
    return config for key of @block.getAttributes() when config = Trix.blockAttributes[key]
    {}

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  appendExtraNewlineElement: ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        @element.appendChild(document.createElement("br"))
