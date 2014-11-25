#= require trix/views/text_view

{makeElement} = Trix.DOM

class Trix.BlockView extends Trix.ObjectView
  constructor: ->
    super
    @block = @object
    @config = @block.getConfig()
    @textConfig = @config.text ? {}

  createNodes: ->
    @element = makeElement(@config.tagName)

    if @block.isEmpty()
      @element.appendChild(makeElement("br"))
    else
      textView = @findOrCreateCachedChildView(Trix.TextView, @block.text, {@textConfig})
      @element.appendChild(node) for node in textView.getNodes()
      @appendExtraNewlineElement()

    [@element]

  createGroupElement: ->
    makeElement(@config.groupTagName)

  # A single <br> at the end of a block element has no visual representation
  # so add an extra one.
  appendExtraNewlineElement: ->
    if string = @block.toString()
      # A newline followed by the block break newline
      if /\n\n$/.test(string)
        @element.appendChild(makeElement("br"))
