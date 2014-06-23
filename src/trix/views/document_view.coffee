#= require trix/views/block_view

class Trix.DocumentView
  constructor: (@element, @document) ->

  render: ->
    @element.removeChild(@element.lastChild) while @element.lastChild
    @document.eachBlock (block, index) =>
      textView = new Trix.BlockView block, index
      @element.appendChild(textView.render())

  focus: ->
    @element.focus()
