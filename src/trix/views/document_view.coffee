#= require trix/views/view
#= require trix/views/block_view

class Trix.DocumentView extends Trix.View
  constructor: (@element, @document) ->

  render: ->
    @resetNodeRecords()
    @element.removeChild(@element.lastChild) while @element.lastChild
    unless @document.isEmpty()
      @document.eachBlock (block, index) =>
        blockView = @createChildView(Trix.BlockView, block, index)
        @element.appendChild(blockView.render())

  focus: ->
    @element.focus()
