#= require trix/utilities/dom
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
    @recordNodeWithLocation(@element, offset: 0)

    if @block.isEmpty()
      br = document.createElement("br")
      @recordNodeWithLocation(br, offset: 0)
      @element.appendChild(br)
    else
      textView = @findOrCreateChildView(Trix.TextView, @block.text, {@textConfig})
      @element.appendChild(textView.render())
      @appendExtraNewlineElement()

    [@element]

  getBlockConfig: ->
    return config for key of @block.getAttributes() when (config = Trix.attributes[key])?.block
    {}

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  appendExtraNewlineElement: ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        @element.appendChild(document.createElement("br"))
