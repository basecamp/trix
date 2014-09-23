#= require trix/utilities/dom
#= require trix/views/text_view


class Trix.BlockView
  constructor: (@block, @blockIndex) ->
    @text = @block.text
    @blockConfig = @getBlockConfig()

  render: ->
    @element = document.createElement(@blockConfig.tagName ? "div")
    @element.dataset.trixBlockIndex = @blockIndex

    if @block.isEmpty()
      @element.appendChild(createBRElementForPosition(0))
    else
      textView = new Trix.TextView @block.text, @blockConfig
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
        @element.appendChild(createBRElementForPosition(string.length - 1))

  createBRElementForPosition = (position) ->
    element = document.createElement("br")
    element.dataset.trixPosition = position
    element.dataset.trixLength = 1
    element
