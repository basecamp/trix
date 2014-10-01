#= require trix/utilities/dom
#= require trix/views/view
#= require trix/views/text_view

class Trix.BlockView extends Trix.View
  constructor: (@block, @blockIndex) ->
    @blockConfig = @getBlockConfig()
    @textConfig = @blockConfig.text ? {}

  render: ->
    @element = document.createElement(@blockConfig.tagName ? "div")
    @cacheNode(@element, index: @blockIndex, offset: 0)
    if @block.isEmpty()
      br = document.createElement("br")
      @cacheNode(br, index: @blockIndex, offset: 0)
      @element.appendChild(br)
    else
      textView = @createChildView(Trix.TextView, @block.text, @textConfig)
      @element.appendChild(textView.render())
      @appendExtraNewlineElement()
    @element

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
