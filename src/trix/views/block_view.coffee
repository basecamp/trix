#= require trix/views/object_view
#= require trix/views/text_view

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    @config = @block.getConfig()
    @textConfig = @config.text ? {}

  createNodes: ->
    @element = document.createElement(@config.tagName)

    if @block.isEmpty()
      br = document.createElement("br")
      @element.appendChild(br)
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      @element.appendChild(node) for node in textView.getNodes()
      @appendExtraNewlineElement()

    [@element]

  createGroupElement: ->
    document.createElement(@config.groupTagName)

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  appendExtraNewlineElement: ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        @element.appendChild(document.createElement("br"))
