#= require trix/views/block_view

class Trix.DocumentView
  constructor: (@element, @document) ->
    @element.dataset.trixBlockIndex = 0
    @element.dataset.trixPosition = 0

  render: ->
    @element.removeChild(@element.lastChild) while @element.lastChild
    unless @document.isEmpty()
      @document.eachBlock (block, index) =>
        blockView = new Trix.BlockView block, index
        @element.appendChild(blockView.render())

  focus: ->
    @element.focus()
